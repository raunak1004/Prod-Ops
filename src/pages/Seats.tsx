import React from 'react';
import { SeatAllocation } from "@/components/SeatAllocation";
import { useSeats } from "@/hooks/useSeats";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Seats = () => {
  const { seats, loading, error } = useSeats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading seats...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Seat Data Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-slate-600 text-xs mt-2">Failed to load seating information. Please refresh the page or try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seat Allocation</h1>
          <p className="text-slate-600 mt-1">Manage seating arrangements and workspace allocation</p>
        </div>
        
        <SeatAllocation />
      </div>
    </div>
  );
};

export default Seats;