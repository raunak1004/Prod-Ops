import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceOverview } from "@/components/ResourceOverview";
import ProjectHoursCarousel from "@/components/ProjectHoursCarousel";
import { EmployeesList } from "@/components/EmployeesList";
import { ResourceUtilization } from "@/components/ResourceUtilization";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

const Resources = () => {
  const { projects, loading, error, deliverables, issues } = useProjects();

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

  // Non-blocking error banner

  // Transform projects to match the legacy format
  const transformedProjects = projects.map(project => {
    // Calculate deliverables and blockers for this project
    const projectDeliverables = deliverables.filter(d => d.project_id === project.id);
    const completedDeliverables = projectDeliverables.filter(d => d.status === 'completed' || d.status === 'done').length;
    const totalDeliverables = projectDeliverables.length;
    const projectBlockers = issues.filter(i => i.project_id === project.id && i.status === 'open' && i.severity === 'high').length;
    const teamSize = new Set(projectDeliverables.map(d => d.assignee_name)).size;
    return {
    id: project.id, // Use full UUID
    name: project.name,
    type: "Projects" as const,
    status: project.status as "green" | "amber" | "red",
    progress: project.progress,
    dueDate: project.end_date || '',
    department: project.manager?.department || 'Unknown',
    lead: project.manager?.full_name || 'Unassigned',
      deliverables: totalDeliverables,
      completedDeliverables: completedDeliverables,
      blockers: projectBlockers,
      teamSize: teamSize,
    hoursAllocated: 0,
    hoursUsed: 0,
    lastCallDate: '',
    pmStatus: project.status as "green" | "amber" | "red",
    opsStatus: project.status as "green" | "amber" | "red",
    healthTrend: "constant" as const,
    monthlyDeliverables: [],
    pastWeeksStatus: []
    };
  });

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
            <div className="space-y-6">
              <ProjectHoursCarousel />
              <ResourceOverview projects={transformedProjects} />
            </div>
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