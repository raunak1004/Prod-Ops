import React from 'react';
import { SeatAllocation } from "@/components/SeatAllocation";
import { useSeats } from "@/hooks/useSeats";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

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

  // Non-blocking error banner

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-medium">Some data failed to load</div>
                  <div>{error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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