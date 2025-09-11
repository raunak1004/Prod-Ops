import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, AlertTriangle, TrendingUp, Filter, Loader2, Zap } from "lucide-react";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { ResourceOverview } from "@/components/ResourceOverview";

const Overview = () => {
  const { projects, tasks, issues, deliverables, loading, error } = useProjects();
  const [allocations, setAllocations] = useState([]);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  const addSampleData = async () => {
    try {
      // Add sample projects
      const { data: project1 } = await supabase.from('projects').insert([{
        name: 'Product Launch Campaign',
        description: 'Launch new product line with marketing campaign',
        status: 'active',
        priority: 'high',
        progress: 65,
        start_date: '2024-01-15',
        end_date: '2024-06-30',
        budget: 50000,
        pm_status: 'green',
        ops_status: 'green'
      }]).select().single();

      const { data: project2 } = await supabase.from('projects').insert([{
        name: 'Customer Portal Redesign',
        description: 'Modernize customer self-service portal',
        status: 'planning',
        priority: 'medium',
        progress: 25,
        start_date: '2024-03-01',
        end_date: '2024-08-15',
        budget: 75000,
        pm_status: 'amber',
        ops_status: 'amber'
      }]).select().single();

      // Add sample deliverables
      await supabase.from('deliverables').insert([
        {
          project_id: project1?.id,
          name: 'Marketing Materials',
          description: 'Brochures, flyers, and digital assets',
          status: 'completed',
          due_date: '2024-02-15'
        },
        {
          project_id: project1?.id,
          name: 'Launch Event',
          description: 'Product launch event planning and execution',
          status: 'in-progress',
          due_date: '2024-06-15'
        },
        {
          project_id: project2?.id,
          name: 'User Research',
          description: 'Customer interviews and usability testing',
          status: 'completed',
          due_date: '2024-03-30'
        },
        {
          project_id: project2?.id,
          name: 'Design Mockups',
          description: 'UI/UX design mockups and prototypes',
          status: 'pending',
          due_date: '2024-05-15'
        }
      ]);

      // Add sample tasks
      await supabase.from('tasks').insert([
        {
          project_id: project1?.id,
          title: 'Create marketing copy',
          description: 'Write compelling copy for all marketing materials',
          status: 'completed',
          priority: 'high'
        },
        {
          project_id: project1?.id,
          title: 'Book launch venue',
          description: 'Secure and book venue for product launch event',
          status: 'in-progress',
          priority: 'high'
        },
        {
          project_id: project2?.id,
          title: 'Conduct user interviews',
          description: 'Interview 20 customers about portal usage',
          status: 'completed',
          priority: 'medium'
        }
      ]);

      // Add sample issues
      await supabase.from('issues').insert([
        {
          project_id: project1?.id,
          title: 'Venue availability limited',
          description: 'Preferred venues have limited availability in June',
          severity: 'medium',
          status: 'open'
        },
        {
          project_id: project2?.id,
          title: 'Design approval delayed',
          description: 'Stakeholder feedback taking longer than expected',
          severity: 'high',
          status: 'open'
        }
      ]);

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add sample data:', error);
      alert('Failed to add sample data. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const { data, error } = await supabase.from('allocations').select('*');
        if (!error && data) setAllocations(data);
      } catch (e) {
        console.warn('Failed to fetch allocations:', e);
      }
    };
    fetchAllocations();
  }, []);

  // Enrich projects with real allocation data
  const projectsWithResources = projects.map(project => {
    const projectAllocations = allocations.filter(a => a.project_id === project.id);
    const teamSize = new Set(projectAllocations.map(a => a.employee_id)).size;
    const hoursAllocated = projectAllocations.reduce((sum, a) => sum + a.allocation, 0);
    // For demo, use hoursAllocated as hoursUsed (unless you have real usage data)
    const hoursUsed = hoursAllocated;
    return {
      ...project,
      teamSize,
      hoursAllocated,
      hoursUsed
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const greenCount = projects.filter(p => p.status === "active").length;
  const amberCount = projects.filter(p => p.status === "planning").length;
  const redCount = projects.filter(p => p.status === "completed").length;

  // Defensive calculations for deliverables and blockers
  const totalProjects = projects.length;
  const totalDeliverables = deliverables.length;
  const completedDeliverables = deliverables.filter(d => d.status === "completed").length;
  const totalBlockers = issues.filter(i => i.status === "open" && i.severity === "high").length;
  const deliverableProgress = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  // Defensive calculation for resource utilization
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const resourceUtilization = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const hasData = projects.length > 0 || tasks.length > 0 || issues.length > 0 || deliverables.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Inline error banner (non-blocking) */}
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

        {/* Empty state helper */}
        {!hasData && (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Data Available</h3>
              <p className="text-slate-600 mb-4">Add sample data to explore the dashboard.</p>
              <Button variant="outline" onClick={addSampleData}>Add Sample Data</Button>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Cards */}
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
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-600">{greenCount} On Track</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-slate-600">{amberCount} At Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-slate-600">{redCount} Delayed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables Progress card removed as requested */}

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
              <div className="text-2xl font-bold text-slate-900">
                {resourceUtilization}%
              </div>
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
              <div className="text-2xl font-bold text-slate-900">
                {projects.length > 0 ? Math.round((projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)) : 0}%
              </div>
              <p className="text-xs text-slate-600 mt-1">Average project progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Overview (department breakdown, etc.) */}
        <ResourceOverview projects={projectsWithResources.map(p => {
          // Calculate deliverables and blockers for this project
          const projectDeliverables = deliverables.filter(d => d.project_id === p.id);
          const completedDeliverables = projectDeliverables.filter(d => d.status === "completed" || d.status === "done").length;
          const totalDeliverables = projectDeliverables.length;
          const projectBlockers = issues.filter(i => i.project_id === p.id && i.status === "open" && i.severity === "high").length;
          return {
            id: p.id,
            name: p.name,
            status: p.status as "green" | "amber" | "red" | "not-started",
            progress: p.progress,
            dueDate: p.end_date || '',
            department: p.manager?.department || 'Unknown',
            lead: p.manager?.full_name || 'Unassigned',
            deliverables: totalDeliverables,
            completedDeliverables: completedDeliverables,
            blockers: projectBlockers,
            teamSize: p.teamSize,
            hoursAllocated: p.hoursAllocated,
            hoursUsed: p.hoursUsed
          };
        })} />

        {/* Executive Summary */}
        <ExecutiveSummary projects={projectsWithResources.map(p => {
          // Calculate deliverables and blockers for this project
          const projectDeliverables = deliverables.filter(d => d.project_id === p.id);
          const completedDeliverables = projectDeliverables.filter(d => d.status === "completed" || d.status === "done").length;
          const totalDeliverables = projectDeliverables.length;
          const projectBlockers = issues.filter(i => i.project_id === p.id && i.status === "open" && i.severity === "high").length;
          return {
            id: p.id,
          name: p.name,
          type: "Projects" as const,
          status: p.status as "green" | "amber" | "red",
          progress: p.progress,
          dueDate: p.end_date || '',
          department: p.manager?.department || 'Unknown',
          lead: p.manager?.full_name || 'Unassigned',
            deliverables: totalDeliverables,
            completedDeliverables: completedDeliverables,
            blockers: projectBlockers,
            teamSize: p.teamSize,
            hoursAllocated: p.hoursAllocated,
            hoursUsed: p.hoursUsed,
          lastCallDate: '',
          pmStatus: p.status as "green" | "amber" | "red",
          opsStatus: p.status as "green" | "amber" | "red",
          healthTrend: "constant" as const,
          monthlyDeliverables: [],
          pastWeeksStatus: []
          };
        })} />
      </div>
    </div>
  );
};

export default Overview;