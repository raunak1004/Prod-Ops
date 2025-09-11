import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: number;
  name: string;
  type: "Projects" | "Products";
  status: "green" | "amber" | "red";
  progress: number;
  dueDate: string;
  department: string;
  lead: string;
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
  lastCallDate: string;
  pmStatus: "green" | "amber" | "red";
  opsStatus: "green" | "amber" | "red";
  healthTrend: "improving" | "declining" | "constant";
}

export const ResourceUtilization = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { employees, loading: employeesLoading } = useEmployees();
  const [filterStatus, setFilterStatus] = useState("all");
  const [allocations, setAllocations] = useState<any[]>([]);

  // Fetch allocations from Supabase
  React.useEffect(() => {
    const fetchAllocations = async () => {
      const { data, error } = await supabase.from('allocations').select('*');
      if (!error && data) setAllocations(data);
    };
    fetchAllocations();
  }, []);

  // Calculate utilization for each employee
  const employeeUtilizationData = employees.map(emp => {
    const empAllocations = allocations.filter(a => a.employee_id === emp.id);
    const totalAllocation = empAllocations.reduce((sum, a) => sum + a.allocation, 0);
    let status = 'optimal';
    if (totalAllocation > 100) status = 'overworked';
    else if (totalAllocation < 60) status = 'underworked';
    return {
      id: emp.id,
      name: emp.full_name,
      role: emp.position,
      totalAllocation,
      status,
      projects: empAllocations.map(a => {
        const project = projects.find(p => p.id === a.project_id);
        return {
          name: project?.name || 'Unknown',
          allocation: a.allocation
        };
      })
    };
  });

  const filteredEmployees = employeeUtilizationData.filter(employee => {
    if (filterStatus === "all") return true;
    return employee.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overworked": return "text-red-600 bg-red-50 border-red-200";
      case "underworked": return "text-amber-600 bg-amber-50 border-amber-200";
      case "optimal": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overworked": return <TrendingUp className="h-4 w-4" />;
      case "underworked": return <TrendingDown className="h-4 w-4" />;
      case "optimal": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const overworkedCount = employeeUtilizationData.filter(emp => emp.status === "overworked").length;
  const underworkedCount = employeeUtilizationData.filter(emp => emp.status === "underworked").length;
  const optimalCount = employeeUtilizationData.filter(emp => emp.status === "optimal").length;

  if (projectsLoading || employeesLoading) {
    return <div className="p-6 text-center">Loading utilization data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Overworked</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{overworkedCount}</div>
            <p className="text-xs text-slate-600 mt-1">Exceeding allocated hours</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Underworked</CardTitle>
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{underworkedCount}</div>
            <p className="text-xs text-slate-600 mt-1">Below allocated capacity</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Optimal</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{optimalCount}</div>
            <p className="text-xs text-slate-600 mt-1">Balanced workload</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Utilization</CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(employeeUtilizationData.reduce((sum, emp) => sum + emp.totalAllocation, 0) / employeeUtilizationData.length)}%
            </div>
            <p className="text-xs text-slate-600 mt-1">Team average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Employee Utilization Details</h3>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overworked">Overworked</SelectItem>
            <SelectItem value="underworked">Underworked</SelectItem>
            <SelectItem value="optimal">Optimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Utilization Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                    <Badge variant="secondary" className="text-xs">{employee.role}</Badge>
                  </div>
                </div>
                <Badge className={`${getStatusColor(employee.status)} flex items-center gap-1`}>
                  {getStatusIcon(employee.status)}
                  {employee.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Utilization Rate</span>
                  <span className="font-medium">{employee.totalAllocation}%</span>
                </div>
                <Progress value={Math.min(employee.totalAllocation, 150)} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{employee.totalAllocation}h used</span>
                  <span>100h allocated</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Project Assignments</h4>
                <div className="space-y-2">
                  {employee.projects.map((project, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className={`${project.name === 'Unknown' ? 'text-amber-600' : 'text-slate-600'}`}>
                        {project.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{project.allocation}h</span>
                        <Badge variant="outline" className="text-xs">
                          Allocation
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No employees found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filter criteria.</p>
        </div>
      )}
    </div>
  );
};