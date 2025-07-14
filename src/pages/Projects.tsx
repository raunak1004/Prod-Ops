import React, { useState } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Projects = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  const { projects, loading, error, updateProjectStatus, deliverables } = useProjects();

  const handleStatusUpdate = async (projectId: string, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => {
    try {
      // Map UI status type to database field name
      const dbStatusType = statusType === 'pmStatus' ? 'pm_status' : statusType === 'opsStatus' ? 'ops_status' : 'status';
      await updateProjectStatus(projectId, newStatus, dbStatusType as 'status' | 'pm_status' | 'ops_status');
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };
  
  // Map status from DB to UI values
  const mapStatusToUIStatus = (dbStatus: string): "green" | "amber" | "red" | "not-started" => {
    switch (dbStatus?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'green':
        return 'green';
      case 'planning':
      case 'pending':
      case 'amber':
        return 'amber';
      case 'on-hold':
      case 'cancelled':
      case 'red':
        return 'red';
      case 'not-started':
        return 'not-started';
      default:
        return 'not-started';
    }
  };

  // Transform projects to match the legacy format for ProjectCard component
  const transformedProjects = React.useMemo(() => projects.map(project => {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate deliverables for this project for the current month only
    const projectDeliverables = deliverables.filter(d => d.project_id === project.id && d.due_date && new Date(d.due_date).getMonth() === currentMonth && new Date(d.due_date).getFullYear() === currentYear);
    const completedDeliverables = projectDeliverables.filter(d => 
      d.status === 'completed' || d.status === 'done'
    ).length;
    const totalDeliverables = projectDeliverables.length;
    
    // Calculate progress as percentage of completed deliverables for current month
    const progressPercentage = totalDeliverables > 0 ? 
      Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

    return {
      id: project.id, // Use full UUID instead of converting to number
      originalId: project.id, // Keep original ID for navigation
      name: project.name,
      type: "Projects" as const,
      status: mapStatusToUIStatus(project.status),
      progress: progressPercentage,
      dueDate: project.end_date || '',
      department: project.manager?.department || 'Unknown',
      lead: project.manager?.full_name || 'Unassigned',
      deliverables: totalDeliverables,
      completedDeliverables: completedDeliverables,
      blockers: 0, // These would need to be calculated from issues table
      teamSize: 0, // This would need to be calculated from task assignments
      hoursAllocated: 0,
      hoursUsed: 0,
      lastCallDate: new Date(project.updated_at).toISOString().split('T')[0],
      pmStatus: mapStatusToUIStatus(project.pm_status || 'not-started'),
      opsStatus: mapStatusToUIStatus(project.ops_status || 'not-started'),
      healthTrend: "constant" as const,
      monthlyDeliverables: [],
      pastWeeksStatus: []
    };
  }), [projects, deliverables]);
  
  // Filter projects based on filters - also use useMemo to prevent unnecessary re-calculations
  const filteredProjects = React.useMemo(() => transformedProjects.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
    return true;
  }), [transformedProjects, filters]);

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
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;