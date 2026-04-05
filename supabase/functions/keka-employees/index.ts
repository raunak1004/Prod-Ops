import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Keka auth (shared pattern) ───────────────────────────────────────────────

async function getKekaToken(): Promise<string> {
  const clientId     = Deno.env.get('KEKA_CLIENT_ID');
  const clientSecret = Deno.env.get('KEKA_CLIENT_SECRET');
  const apiKey       = Deno.env.get('KEKA_API_KEY');

  if (!clientId || !clientSecret || !apiKey) {
    throw new Error('Missing Keka credentials. Set KEKA_CLIENT_ID, KEKA_CLIENT_SECRET, KEKA_API_KEY.');
  }

  const body = new URLSearchParams({
    grant_type:    'kekaapi',
    scope:         'kekaapi',
    client_id:     clientId,
    client_secret: clientSecret,
    api_key:       apiKey,
  });

  const res = await fetch('https://login.keka.com/connect/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body,
  });

  if (!res.ok) throw new Error(`Keka auth failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

// ─── Fetch all employees (handles Keka pagination) ────────────────────────────

async function fetchKekaEmployees(token: string): Promise<any[]> {
  const baseUrl = Deno.env.get('KEKA_BASE_URL') ?? 'https://foxsense.keka.com';
  const all: any[] = [];
  let pageNumber = 1;
  const pageSize = 100;

  while (true) {
    const url = `${baseUrl}/api/v1/hris/employees?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`Keka employees fetch failed (${res.status}): ${await res.text()}`);
    const body = await res.json();

    const records: any[] = Array.isArray(body) ? body : (body.data ?? []);
    if (records.length === 0) break;
    all.push(...records);
    if (records.length < pageSize) break;
    pageNumber++;
  }

  return all;
}

// ─── Map Keka employee → employees table row ──────────────────────────────────

// Safely extract a string from a value that may be a string or a Keka object like
// { identifier: "...", title: "Admin" } or { identifier: "...", name: "Engineering" }
function extractString(val: any, ...keys: string[]): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val || null;
  if (typeof val === 'object') {
    for (const k of keys) {
      if (typeof val[k] === 'string' && val[k]) return val[k];
    }
  }
  return null;
}

function mapEmployee(ke: any) {
  const firstName = extractString(ke.firstName ?? ke.first_name) ?? '';
  const lastName  = extractString(ke.lastName  ?? ke.last_name)  ?? '';
  const fullName  = (
    extractString(ke.displayName) ??
    extractString(ke.fullName)    ??
    extractString(ke.full_name)   ??
    `${firstName} ${lastName}`.trim()
  ) || 'Unknown';

  // Department lives in groups array as groupType 1
  const department = (() => {
    if (Array.isArray(ke.groups)) {
      const deptGroup = ke.groups.find((g: any) => g.groupType === 1);
      if (deptGroup?.title) return deptGroup.title as string;
    }
    // Fallbacks for other Keka tenants
    return extractString(ke.department, 'name', 'title') ?? extractString(ke.departmentName) ?? null;
  })();

  const status = (() => {
    const raw = ke.employmentStatus ?? ke.accountStatus ?? ke.status ?? '';
    const s = (typeof raw === 'string' ? raw : extractString(raw, 'title', 'name') ?? '').toLowerCase();
    if (s.includes('inactive') || s.includes('terminated') || s.includes('resigned') || s.includes('exit')) return 'inactive';
    return 'active';
  })();

  // Keka hire date field is joiningDate
  const hireDate = ke.joiningDate ?? ke.dateOfJoining ?? ke.hireDate ?? ke.hire_date ?? null;

  return {
    employee_id:      String(ke.employeeNumber ?? ke.employeeId ?? ke.employee_id ?? ke.id ?? ''),
    full_name:        fullName,
    email:            extractString(ke.email ?? ke.workEmail ?? ke.work_email),
    avatar_url:       extractString(ke.image ?? ke.profileImageUrl ?? ke.avatarUrl ?? ke.avatar_url),
    department,
    position:         extractString(ke.jobTitle, 'title', 'name') ?? extractString(ke.designation) ?? extractString(ke.position),
    hire_date:        typeof hireDate === 'string' ? hireDate.split('T')[0] : null,
    status,
    utilization_rate: 0,
  };
}

// ─── Upsert employees by employee_id ──────────────────────────────────────────

async function upsertEmployees(
  supabase: ReturnType<typeof createClient>,
  kekaEmployees: any[]
): Promise<{ inserted: number; updated: number; skipped: number; deduped: number }> {
  let inserted = 0, updated = 0, skipped = 0, deduped = 0;

  for (const ke of kekaEmployees) {
    const row = mapEmployee(ke);

    if (!row.full_name || row.full_name === 'Unknown') { skipped++; continue; }

    // ── Step 1: find existing row — email is the best unique key ──────────────
    let existing: { id: string } | null = null;

    // 1a. Match by email (most reliable — one email per person)
    if (row.email) {
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('email', row.email)
        .maybeSingle();
      existing = data;
    }

    // 1b. Match by employee_id from Keka (handles cases without email)
    if (!existing && row.employee_id) {
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', row.employee_id)
        .maybeSingle();
      existing = data;
    }

    // 1c. Last resort: full name match
    if (!existing) {
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('full_name', row.full_name)
        .maybeSingle();
      existing = data;
    }

    // ── Step 2: upsert ────────────────────────────────────────────────────────
    if (existing) {
      await supabase.from('employees').update(row).eq('id', existing.id);
      updated++;

      // ── Step 3: dedup — mark any OTHER rows with same email as inactive ──
      if (row.email) {
        const { data: dupes } = await supabase
          .from('employees')
          .select('id')
          .eq('email', row.email)
          .neq('id', existing.id);

        if (dupes && dupes.length > 0) {
          await supabase
            .from('employees')
            .update({ status: 'inactive' })
            .in('id', dupes.map((d: any) => d.id));
          deduped += dupes.length;
        }
      }
    } else {
      await supabase.from('employees').insert({ ...row, skills: [] });
      inserted++;
    }
  }

  return { inserted, updated, skipped, deduped };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token         = await getKekaToken();
    const kekaEmployees = await fetchKekaEmployees(token);

    if (!kekaEmployees.length) {
      return new Response(
        JSON.stringify({ success: true, inserted: 0, updated: 0, skipped: 0, message: 'No employees returned from Keka.' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller wants to inspect the raw Keka payload (pass ?debug=1)
    const url = new URL(req.url);
    if (url.searchParams.get('debug') === '1') {
      return new Response(
        JSON.stringify({ sample: kekaEmployees.slice(0, 2), keys: Object.keys(kekaEmployees[0] ?? {}) }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const { inserted, updated, skipped, deduped } = await upsertEmployees(supabase, kekaEmployees);

    return new Response(
      JSON.stringify({ success: true, inserted, updated, skipped, deduped, total: kekaEmployees.length }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[keka-employees]', err.message);
    // Return 200 so the client can read the error message (non-2xx swallows the body)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
