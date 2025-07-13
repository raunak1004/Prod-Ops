import React, { useState } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Projects = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  const { projects, loading, error, updateProjectStatus } = useProjects();

  const handleStatusUpdate = async (projectId: string, statusType: 'status', newStatus: string) => {
    try {
      await updateProjectStatus(projectId, newStatus);
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };
  
  // Transform projects to match the legacy format for ProjectCard component
  const transformedProjects = projects.map(project => ({
    id: project.id, // Use full UUID instead of converting to number
    originalId: project.id, // Keep original ID for navigation
    name: project.name,
    type: "Projects" as const,
    status: project.status as "green" | "amber" | "red",
    progress: project.progress,
    dueDate: project.end_date || '',
    department: project.manager?.department || 'Unknown',
    lead: project.manager?.full_name || 'Unassigned',
    deliverables: 0, // These would need to be calculated from deliverables table
    completedDeliverables: 0,
    blockers: 0, // These would need to be calculated from issues table
    teamSize: 0, // This would need to be calculated from task assignments
    hoursAllocated: 0,
    hoursUsed: 0,
    lastCallDate: '',
    pmStatus: project.status as "green" | "amber" | "red",
    opsStatus: project.status as "green" | "amber" | "red",
    healthTrend: "constant" as const,
    monthlyDeliverables: [],
    pastWeeksStatus: []
  }));
  
  // Filter projects based on filters
  const filteredProjects = transformedProjects.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading projects...</span>
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
            <h3 className="text-lg font-semibold text-red-700 mb-2">Projects Loading Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-slate-600 text-xs mt-2">Unable to retrieve project data. Please check your network connection and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects and Products</h1>
            <p className="text-slate-600 mt-1">Track and manage all your active projects and products</p>
          </div>
          <TaskFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onStatusUpdate={(id, statusType, newStatus) => {
                if (statusType === 'status') {
                  handleStatusUpdate(id, 'status', newStatus);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;