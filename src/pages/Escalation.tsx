import React from 'react';
import { IssuesTracker } from "@/components/IssuesTracker";
import { useProjects } from "@/hooks/useProjects";

const Escalation = () => {
  const { projects, loading } = useProjects();

  // Transform projects to match the legacy format for IssuesTracker component
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">Loading escalation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Escalation Management</h1>
          <p className="text-slate-600 mt-1">Track and resolve critical issues requiring escalation</p>
        </div>
        
        <IssuesTracker projects={transformedProjects} />
      </div>
    </div>
  );
};

export default Escalation;