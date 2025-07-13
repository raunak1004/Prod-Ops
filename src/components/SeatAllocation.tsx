import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, User, Search } from "lucide-react";

interface Seat {
  id: string;
  level: number;
  seatNumber: number;
  employee?: {
    name: string;
    department: string;
    email: string;
  };
}

// Mock employees data
const employees = [
  { name: "John Doe", department: "Engineering", email: "john@company.com" },
  { name: "Jane Smith", department: "Marketing", email: "jane@company.com" },
  { name: "Mike Johnson", department: "Sales", email: "mike@company.com" },
  { name: "Sarah Wilson", department: "HR", email: "sarah@company.com" },
  { name: "David Brown", department: "Finance", email: "david@company.com" },
];

export const SeatAllocation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  
  // Initialize seats data
  const [seats, setSeats] = useState<Seat[]>(() => {
    const allSeats: Seat[] = [];
    
    // Level 1: 48 seats
    for (let i = 1; i <= 48; i++) {
      allSeats.push({
        id: `L1-${i}`,
        level: 1,
        seatNumber: i,
      });
    }
    
    // Level 2: 52 seats
    for (let i = 1; i <= 52; i++) {
      allSeats.push({
        id: `L2-${i}`,
        level: 2,
        seatNumber: i,
      });
    }
    
    return allSeats;
  });

  const filteredSeats = seats.filter(seat => {
    const levelMatch = selectedLevel === "all" || seat.level.toString() === selectedLevel;
    const searchMatch = !searchTerm || 
      seat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.employee?.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return levelMatch && searchMatch;
  });

  const level1Seats = seats.filter(seat => seat.level === 1);
  const level2Seats = seats.filter(seat => seat.level === 2);
  
  const level1Occupied = level1Seats.filter(seat => seat.employee).length;
  const level2Occupied = level2Seats.filter(seat => seat.employee).length;
  const totalOccupied = level1Occupied + level2Occupied;

  const assignEmployee = (seatId: string, employee: any) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId ? { ...seat, employee } : seat
    ));
  };

  const unassignSeat = (seatId: string) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId ? { ...seat, employee: undefined } : seat
    ));
  };

  const renderSeatCard = (seat: Seat) => (
    <Card 
      key={seat.id} 
      className={`group cursor-pointer transition-all duration-300 hover-scale relative min-h-[120px] ${
        seat.employee 
          ? 'border-emerald-400/60 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-emerald-100 dark:shadow-emerald-950/50' 
          : 'seamless-card hover:border-brand/40 hover:shadow-brand/10'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant={seat.employee ? "default" : "secondary"} 
            className={`text-xs font-medium ${
              seat.employee 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                : 'bg-brand/10 text-brand border-brand/20'
            }`}
          >
            {seat.id}
          </Badge>
        </div>
        
        {seat.employee ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold truncate text-foreground">{seat.employee.name}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
              {seat.employee.department}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => unassignSeat(seat.id)}
              className="w-full text-xs h-8 seamless-button border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Unassign
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground font-medium">Available</div>
            <Select onValueChange={(employeeName) => {
              const employee = employees.find(e => e.name === employeeName);
              if (employee) assignEmployee(seat.id, employee);
            }}>
              <SelectTrigger className="w-full h-8 text-xs seamless-input">
                <SelectValue placeholder="Assign Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.email} value={employee.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{employee.name}</span>
                      <span className="text-xs text-muted-foreground">{employee.department}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLevel = (level: number) => {
    const levelSeats = filteredSeats.filter(seat => seat.level === level);
    const seatsPerRow = level === 1 ? 6 : 4;
    const rows = level === 1 ? 8 : 13;
    
    if (selectedLevel !== "all" && selectedLevel !== level.toString()) {
      return null;
    }

    return (
      <Card key={level} className="seamless-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-brand/10 border border-brand/20">
                <span className="text-lg font-bold text-brand">L{level}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {level}</h2>
                <p className="text-muted-foreground">
                  {seatsPerRow} seats × {rows} rows = {seatsPerRow * rows} total seats
                </p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {levelSeats.filter(s => s.employee).length} / {seatsPerRow * rows} occupied
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 bg-muted/30 backdrop-blur-sm">
            <div className="space-y-6">
              {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center gap-6">
                  <div className="flex gap-4">
                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                      const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                      const seat = levelSeats.find(s => s.seatNumber === seatNumber);
                      
                      if (!seat) return null;
                      
                      return (
                        <div key={seat.id} className="w-24">
                          {renderSeatCard(seat)}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ml-6 flex items-center">
                    <Badge variant="secondary" className="text-xs font-medium">
                      Row {rowIndex + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-brand/10 border border-brand/20">
          <MapPin className="w-7 h-7 text-brand" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
            Seat Allocation
          </h1>
          <p className="text-muted-foreground mt-1">Manage seating arrangements across office levels</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="seamless-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Seats</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">100</div>
            <p className="text-sm text-muted-foreground mt-1">48 (Level 1) + 52 (Level 2)</p>
          </CardContent>
        </Card>
        
        <Card className="seamless-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Occupied</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalOccupied}</div>
            <p className="text-sm text-muted-foreground mt-1">{level1Occupied} (Level 1) + {level2Occupied} (Level 2)</p>
          </CardContent>
        </Card>
        
        <Card className="seamless-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Available</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{100 - totalOccupied}</div>
            <p className="text-sm text-muted-foreground mt-1">{48 - level1Occupied} (Level 1) + {52 - level2Occupied} (Level 2)</p>
          </CardContent>
        </Card>
        
        <Card className="seamless-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-brand">{Math.round((totalOccupied / 100) * 100)}%</div>
            <p className="text-sm text-muted-foreground mt-1">of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="seamless-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search seats, employees, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base seamless-input"
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full lg:w-64 h-12 seamless-input">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1 (6×8 layout)</SelectItem>
                <SelectItem value="2">Level 2 (4×13 layout)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Office Levels */}
      <div className="space-y-12">
        {renderLevel(1)}
        {renderLevel(2)}
      </div>
    </div>
  );
};