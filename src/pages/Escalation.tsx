import { useMemo } from 'react';
import { IssuesTracker } from "@/components/IssuesTracker";
import { useProjects } from "@/hooks/useProjects";
import { LoadingState } from "@/components/ui/loading-state";
import { transformProject } from "@/lib/transforms";

const Escalation = () => {
  const { projects, loading, deliverables, issues } = useProjects();

  const transformedProjects = useMemo(
    () => projects.map(p => transformProject(p, deliverables, issues)),
    [projects, deliverables, issues]
  );

  if (loading) return <LoadingState message="Loading escalation data..." />;

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
