import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Keka API helpers ──────────────────────────────────────────────────────────

async function getKekaToken(): Promise<string> {
  const clientId = Deno.env.get('KEKA_CLIENT_ID');
  const clientSecret = Deno.env.get('KEKA_CLIENT_SECRET');
  const apiKey = Deno.env.get('KEKA_API_KEY');

  if (!clientId || !clientSecret || !apiKey) {
    throw new Error('Missing Keka credentials. Set KEKA_CLIENT_ID, KEKA_CLIENT_SECRET, KEKA_API_KEY.');
  }

  const body = new URLSearchParams({
    grant_type: 'kekaapi',
    scope: 'kekaapi',
    client_id: clientId,
    client_secret: clientSecret,
    api_key: apiKey,
  });

  const res = await fetch('https://login.keka.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keka auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function fetchKekaProjects(token: string): Promise<any[]> {
  const baseUrl = Deno.env.get('KEKA_BASE_URL') ?? 'https://foxsense.keka.com';
  // TODO: confirm the exact Keka projects endpoint
  const url = `${baseUrl}/api/v1/psa/projects`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keka projects fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Keka typically wraps results in a `data` array
  return Array.isArray(data) ? data : (data.data ?? []);
}

// ─── DB upsert ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  active: 'active',
  inprogress: 'active',
  'in progress': 'active',
  completed: 'completed',
  'on-hold': 'on-hold',
  onhold: 'on-hold',
  cancelled: 'cancelled',
  archived: 'cancelled',
};

function mapStatus(kekaStatus: unknown): string {
  if (typeof kekaStatus !== 'string') return 'not-started';
  return STATUS_MAP[kekaStatus.toLowerCase()] ?? 'not-started';
}

async function upsertProjects(
  supabase: ReturnType<typeof createClient>,
  kekaProjects: any[]
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const kp of kekaProjects) {
    const projectData = {
      name: kp.name ?? kp.projectName,
      description: kp.description ?? '',
      status: mapStatus(kp.status),
      pm_status: 'not-started',
      ops_status: 'not-started',
      priority: kp.priority ?? '',
      progress: kp.progress ?? kp.completionPercentage ?? 0,
      start_date: kp.startDate ?? kp.start_date ?? null,
      end_date: kp.endDate ?? kp.end_date ?? null,
      budget: kp.budget ?? null,
    };

    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('name', projectData.name)
      .maybeSingle();

    if (existing) {
      await supabase.from('projects').update(projectData).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('projects').insert(projectData);
      inserted++;
    }
  }

  return { inserted, updated };
}

// ─── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = await getKekaToken();
    const kekaProjects = await fetchKekaProjects(token);

    if (!kekaProjects.length) {
      return new Response(
        JSON.stringify({ success: true, inserted: 0, updated: 0, message: 'No projects returned from Keka.' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const { inserted, updated } = await upsertProjects(supabase, kekaProjects);

    return new Response(
      JSON.stringify({ success: true, inserted, updated, total: kekaProjects.length }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[keka-projects]', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
