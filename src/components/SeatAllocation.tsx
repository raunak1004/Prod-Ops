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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Seat Allocation</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">48 (L1) + 52 (L2)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalOccupied}</div>
            <p className="text-xs text-muted-foreground">{level1Occupied} (L1) + {level2Occupied} (L2)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{100 - totalOccupied}</div>
            <p className="text-xs text-muted-foreground">{48 - level1Occupied} (L1) + {52 - level2Occupied} (L2)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalOccupied / 100) * 100)}%</div>
            <p className="text-xs text-muted-foreground">of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search seats, employees, or departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">Level 1 (48 seats)</SelectItem>
            <SelectItem value="2">Level 2 (52 seats)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredSeats.map((seat) => (
          <Card 
            key={seat.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              seat.employee ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={seat.employee ? "default" : "secondary"}>
                  {seat.id}
                </Badge>
                <span className="text-xs text-muted-foreground">L{seat.level}</span>
              </div>
              
              {seat.employee ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{seat.employee.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{seat.employee.department}</p>
                  <p className="text-xs text-muted-foreground">{seat.employee.email}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => unassignSeat(seat.id)}
                    className="w-full"
                  >
                    Unassign
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Available</div>
                  <Select onValueChange={(employeeName) => {
                    const employee = employees.find(e => e.name === employeeName);
                    if (employee) assignEmployee(seat.id, employee);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.email} value={employee.name}>
                          {employee.name} ({employee.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};