import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Seat {
  id: string;
  location: string;
  floor?: string;
  section?: string;
  seat_number: string;
  type: string;
  status: string;
  assigned_to?: string;
  assigned_date?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    employee_id: string;
    full_name?: string;
    department?: string;
  } | null;
}

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('location', { ascending: true });

      if (error) throw error;
      setSeats(data || []);
    } catch (err) {
      console.error('Error fetching seat data:', err);
      setError('Unable to load seat information. Database connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateSeatAssignment = async (seatId: string, employeeId: string | null) => {
    try {
      const { error } = await supabase
        .from('seats')
        .update({ 
          assigned_to: employeeId,
          assigned_date: employeeId ? new Date().toISOString().split('T')[0] : null,
          status: employeeId ? 'occupied' : 'available'
        })
        .eq('id', seatId);

      if (error) throw error;
      
      // Refresh the data to get updated information
      await fetchSeats();
    } catch (err) {
      console.error('Error updating seat assignment:', err);
      throw err;
    }
  };

  const createSeat = async (seatData: Omit<Seat, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
    try {
      const { error } = await supabase
        .from('seats')
        .insert([seatData]);

      if (error) throw error;
      await fetchSeats();
    } catch (err) {
      console.error('Error creating seat:', err);
      throw err;
    }
  };

  const deleteSeat = async (seatId: string) => {
    try {
      const { error } = await supabase
        .from('seats')
        .delete()
        .eq('id', seatId);

      if (error) throw error;
      await fetchSeats();
    } catch (err) {
      console.error('Error deleting seat:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  return {
    seats,
    loading,
    error,
    refetch: fetchSeats,
    updateSeatAssignment,
    createSeat,
    deleteSeat
  };
};