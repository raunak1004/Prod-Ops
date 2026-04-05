import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, TrendingUp, Filter, Zap } from "lucide-react";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { ResourceOverview } from "@/components/ResourceOverview";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { transformProject } from "@/lib/transforms";

const Overview = () => {
  const { projects, tasks, issues, deliverables, loading, error } = useProjects();
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('allocations')
      .select('*')
      .then(({ data }) => { if (data) setAllocations(data); });
  }, []);

  const transformedProjects = useMemo(() =>
    projects.map(p => {
      const tp = transformProject(p, deliverables, issues);
      const projectAllocations = allocations.filter(a => a.project_id === p.id);
      const teamSize = new Set(projectAllocations.map((a: any) => a.employee_id)).size;
      const hoursAllocated = projectAllocations.reduce((sum: number, a: any) => sum + (a.allocation ?? 0), 0);
      return { ...tp, teamSize: teamSize || tp.teamSize, hoursAllocated, hoursUsed: hoursAllocated };
    }),
    [projects, deliverables, issues, allocations]
  );

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const totalProjects = projects.length;
  const greenCount = projects.filter(p => p.status === 'active').length;
  const amberCount = projects.filter(p => p.status === 'planning').length;
  const redCount = projects.filter(p => p.status === 'on-hold' || p.status === 'cancelled').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const resourceUtilization = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalBlockers = issues.filter(i => i.status === 'unresolved' && (i.severity === 'Sev1' || i.severity === 'Incident')).length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / totalProjects)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Product Operations Dashboard</h1>
            <p className="text-slate-600 mt-1">Executive overview of all projects and products</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Badge variant="outline" className="text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalProjects}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-600">{greenCount} On Track</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-600">{amberCount} At Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-600">{redCount} Delayed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Active Blockers</CardTitle>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalBlockers}</div>
              <p className="text-xs text-slate-600 mt-2">Requiring immediate attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Resource Utilization</CardTitle>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{resourceUtilization}%</div>
              <p className="text-xs text-slate-600 mt-2">
                {completedTasks} / {totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Efficiency Score</CardTitle>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{avgProgress}%</div>
              <p className="text-xs text-slate-600 mt-1">Average project progress</p>
            </CardContent>
          </Card>
        </div>

        <ResourceOverview projects={transformedProjects} />
        <ExecutiveSummary projects={transformedProjects.map(p => ({
          ...p,
          pmStatus: p.pmStatus as 'green' | 'amber' | 'red',
          opsStatus: p.opsStatus as 'green' | 'amber' | 'red',
          status: p.status as 'green' | 'amber' | 'red',
          lastCallDate: '',
        }))} />
      </div>
    </div>
  );
};

export default Overview;
