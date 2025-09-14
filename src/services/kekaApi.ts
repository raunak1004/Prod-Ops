interface KekaOAuthConfig {
  clientId: string;
  clientSecret: string;
  apiKey: string;
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

class KekaApiService {
  private baseUrl = 'https://foxsense.keka.com/api/v1/psa';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private getConfig(): KekaOAuthConfig | null {
    const config = localStorage.getItem('keka-api-config');
    return config ? JSON.parse(config) : null;
  }

  public setConfig(config: KekaOAuthConfig): void {
    localStorage.setItem('keka-api-config', JSON.stringify(config));
  }

  public isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.clientId && config?.clientSecret && config?.apiKey);
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const config = this.getConfig();
    if (!config) {
      throw new Error('Keka API not configured. Please set up your credentials.');
    }

    try {
      // OAuth 2.0 Client Credentials flow
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'read:projects'
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      // Set expiry to 90% of actual expiry to account for clock skew
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000 * 0.9);

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  public async fetchProjects(): Promise<KekaProject[]> {
    try {
      const token = await this.getAccessToken();
      const config = this.getConfig();

      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-API-Key': config?.apiKey || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformKekaProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects from Keka:', error);
      throw error;
    }
  }

  private transformKekaProjects(data: any[]): KekaProject[] {
    return data.map(project => ({
      id: project.id || project.projectId,
      name: project.name || project.projectName,
      description: project.description,
      status: this.mapKekaStatus(project.status),
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
    }));
  }

  private mapKekaStatus(kekaStatus: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'active',
      'COMPLETED': 'completed',
      'ON_HOLD': 'on-hold',
      'CANCELLED': 'cancelled',
      'PLANNED': 'not-started',
      'DRAFT': 'not-started'
    };
    
    return statusMap[kekaStatus?.toUpperCase()] || 'not-started';
  }

  public clearConfig(): void {
    localStorage.removeItem('keka-api-config');
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const kekaApiService = new KekaApiService();
export type { KekaProject, KekaOAuthConfig };