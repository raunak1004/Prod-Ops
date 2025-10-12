import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

const loginUrl = "https://login.keka.com/connect/token";
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

export const getAccessToken = async () => {
  const urlParams = {
    grant_type: 'kekaapi',
    scope: 'kekaapi',
    client_id: import.meta.env.VITE_KEKA_CLIENT_ID,
    client_secret: import.meta.env.VITE_KEKA_CLIENT_SECRET,
    api_key: import.meta.env.VITE_KEKA_API_KEY
  }

  const response = await axios.post(`${loginUrl}`,
    new URLSearchParams(urlParams),
    {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data;
};

export const fetchProjects = async () => {
  const accessToken = localStorage.getItem('keka_access_token');

  if (!accessToken) {
    throw new Error('No access token available. Please log in again.');
  }

  try {
    const response = await axios.post(
      'https://zaptqsllaxhiwandsexv.supabase.co/functions/v1/keka-projects',
      { accessToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to get cached Keka projects from localStorage
export const getCachedKekaProjects = (): KekaProject[] => {
  try {
    const cached = localStorage.getItem('keka_projects');
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error parsing cached Keka projects:', error);
    return [];
  }
}

export const isConfigured = (): boolean => {
  // Since we're using Supabase secrets, always return true
  return true;
}