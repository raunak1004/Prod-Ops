import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KekaProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  progress?: number;
  department?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get secrets from Supabase - using exact secret names you provided
    const clientId = Deno.env.get('keka-client-id-1')
    const clientSecret = Deno.env.get('keka-client-secret-1')
    const apiKey = Deno.env.get('keka-api-1')

    console.log('Checking secrets availability:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasApiKey: !!apiKey
    })

    if (!clientId || !clientSecret || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Keka API credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const baseUrl = 'https://foxsense.keka.com/api/v1/psa'

    // Get OAuth token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'read:projects'
      })
    })

    if (!tokenResponse.ok) {
      console.error('OAuth failed:', await tokenResponse.text())
      return new Response(
        JSON.stringify({ error: `OAuth failed: ${tokenResponse.status}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch projects
    const projectsResponse = await fetch(`${baseUrl}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    })

    if (!projectsResponse.ok) {
      console.error('Projects fetch failed:', await projectsResponse.text())
      return new Response(
        JSON.stringify({ error: `Failed to fetch projects: ${projectsResponse.status}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const projectsData = await projectsResponse.json()
    
    // Transform the data to match our interface
    const transformedProjects: KekaProject[] = projectsData.map((project: any) => ({
      id: project.id || project.projectId,
      name: project.name || project.projectName,
      description: project.description,
      status: mapKekaStatus(project.status),
      startDate: project.startDate || project.startedOn,
      endDate: project.endDate || project.expectedEndDate,
      budget: project.budget || project.budgetAmount,
      manager: project.manager || project.projectManager ? {
        id: project.manager?.id || project.projectManager?.id,
        name: project.manager?.name || project.projectManager?.name,
        email: project.manager?.email || project.projectManager?.email
      } : undefined,
      progress: project.progress || project.completionPercentage || 0,
      department: project.department || project.businessUnit
    }))

    return new Response(
      JSON.stringify(transformedProjects),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in keka-projects function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function mapKekaStatus(kekaStatus: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'COMPLETED': 'completed',
    'ON_HOLD': 'on-hold',
    'CANCELLED': 'cancelled',
    'PLANNED': 'not-started',
    'DRAFT': 'not-started'
  }
  
  return statusMap[kekaStatus?.toUpperCase()] || 'not-started'
}