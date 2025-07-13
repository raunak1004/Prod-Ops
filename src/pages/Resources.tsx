import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceOverview } from "@/components/ResourceOverview";
import { EmployeesList } from "@/components/EmployeesList";
import { ResourceUtilization } from "@/components/ResourceUtilization";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Resources = () => {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading resources...</span>
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
            <h3 className="text-lg font-semibold text-red-700 mb-2">Resource Data Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-slate-600 text-xs mt-2">Please try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform projects to match the legacy format
  const transformedProjects = projects.map(project => ({
    id: project.id, // Use full UUID
    name: project.name,
    type: "Projects" as const,
    status: project.status as "green" | "amber" | "red",
    progress: project.progress,
    dueDate: project.end_date || '',
    department: project.manager?.department || 'Unknown',
    lead: project.manager?.full_name || 'Unassigned',
    deliverables: 0,
    completedDeliverables: 0,
    blockers: 0,
    teamSize: 0,
    hoursAllocated: 0,
    hoursUsed: 0,
    lastCallDate: '',
    pmStatus: project.status as "green" | "amber" | "red",
    opsStatus: project.status as "green" | "amber" | "red",
    healthTrend: "constant" as const,
    monthlyDeliverables: [],
    pastWeeksStatus: []
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-600 mt-1">Monitor and optimize resource allocation across projects</p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <ResourceOverview projects={transformedProjects} />
          </TabsContent>
          
          <TabsContent value="employees" className="mt-6">
            <EmployeesList />
          </TabsContent>
          
          <TabsContent value="allocation" className="mt-6">
            <ResourceAllocation />
          </TabsContent>
          
          <TabsContent value="utilization" className="mt-6">
            <ResourceUtilization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;