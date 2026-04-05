import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectNavigation } from '@/components/ProjectNavigation';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MonthlyDeliverables } from '@/components/MonthlyDeliverables';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { ResourceOverview } from '@/components/ResourceOverview';
import { IssuesTracker } from '@/components/IssuesTracker';
import { LoadingState } from '@/components/ui/loading-state';
import { useProjects } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STATUS_MAP } from '@/lib/constants';

// Deliverable statuses that are already valid UI values — pass through directly
const DELIVERABLE_STATUS_PASS_THROUGH = new Set(['green', 'amber', 'red', 'not-started', 'de-committed', 'done']);

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { projects, deliverables, issues, loading, refetch } = useProjects();

  const [activeTab, setActiveTab] = useState('project');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [weeklyStatuses, setWeeklyStatuses] = useState<any[]>([]);
  const [lastCallDate, setLastCallDate] = useState<Date | null>(null);

  // Find this project
  const raw = useMemo(() => projects.find(p => p.id === id), [projects, id]);

  // Fetch weekly statuses
  useEffect(() => {
    if (!id) return;
    supabase
      .from('weekly_status')
      .select('*')
      .eq('project_id', id)
      .order('week')
      .then(({ data }) => setWeeklyStatuses(data ?? []));
  }, [id]);

  // Sync lastCallDate from project record
  useEffect(() => {
    if ((raw as any)?.last_call_date) {
      setLastCallDate(new Date((raw as any).last_call_date));
    }
  }, [raw]);

  // Build the transformed project shape expected by sub-components
  const project = useMemo(() => {
    if (!raw) return null;

    const projectDeliverables = deliverables.filter(d => d.project_id === raw.id);
    const completed = projectDeliverables.filter(d => ['completed', 'done', 'green'].includes(d.status?.toLowerCase() ?? '')).length;
    const blockers = issues.filter(
      i => i.project_id === raw.id && i.status === 'unresolved'
    ).length;
    const teamSize = new Set(projectDeliverables.map(d => d.assignee_name).filter(Boolean)).size;

    return {
      id: raw.id,
      name: raw.name,
      type: 'Projects' as const,
      status: STATUS_MAP[raw.status?.toLowerCase()] ?? 'not-started',
      progress: raw.progress,
      dueDate: raw.end_date ?? '',
      department: raw.manager?.department ?? 'Unknown',
      lead: raw.manager?.full_name ?? 'Unassigned',
      deliverables: projectDeliverables.length,
      completedDeliverables: completed,
      blockers,
      teamSize,
      hoursAllocated: 0,
      hoursUsed: 0,
      lastCallDate,
      pmStatus: (STATUS_MAP[raw.pm_status?.toLowerCase()] ?? 'not-started') as 'green' | 'amber' | 'red' | 'not-started',
      opsStatus: (STATUS_MAP[raw.ops_status?.toLowerCase()] ?? 'not-started') as 'green' | 'amber' | 'red' | 'not-started',
      healthTrend: 'constant' as const,
      monthlyDeliverables: projectDeliverables.map(d => ({
        id: d.id,
        task: d.name,
        dueDate: d.due_date ?? '',
        description: d.description ?? '',
        type: d.type ?? 'new-feature',
        assignee: d.assignee_name ?? 'Unassigned',
        department: raw.manager?.department ?? 'Unknown',
        status: (DELIVERABLE_STATUS_PASS_THROUGH.has(d.status?.toLowerCase() ?? '') ? d.status?.toLowerCase() : STATUS_MAP[d.status?.toLowerCase()]) ?? 'not-started',
        comments: d.description ?? '',
        flagged: (d as any).flagged ?? false,
      })),
      pastWeeksStatus: weeklyStatuses.map(ws => ({
        week: ws.week,
        status: ws.status as 'green' | 'amber' | 'red' | 'not-started',
      })),
    };
  }, [raw, deliverables, issues, weeklyStatuses, lastCallDate]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleAddTask = async (taskData: any) => {
    if (!raw?.id) return;
    const { error } = await supabase.from('deliverables').insert({
      name: taskData.task,
      description: taskData.description ?? taskData.comments ?? '',
      type: taskData.type,
      assignee_name: taskData.assignee,
      responsible_employee: taskData.assigneeId || null,
      due_date: format(taskData.dueDate, 'yyyy-MM-dd'),
      project_id: raw.id,
      status: 'pending',
    });
    if (error) {
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    } else {
      toast({ title: "Task added" });
      refetch();
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from('deliverables').update({ status: newStatus }).eq('id', taskId);
    if (error) {
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    } else {
      refetch();
    }
  };

  const handleTaskFlag = async (taskId: string, flagged: boolean) => {
    const { error } = await supabase.rpc('set_deliverable_flagged', { p_id: taskId, p_flagged: flagged });
    if (error) {
      toast({ title: "Error", description: "Failed to update flag.", variant: "destructive" });
    } else {
      refetch();
    }
  };

  const handleStatusUpdate = async (statusType: 'pmStatus' | 'opsStatus', newStatus: string) => {
    if (!raw?.id) return;
    const dbField = statusType === 'pmStatus' ? 'pm_status' : 'ops_status';
    const { error } = await supabase.from('projects').update({ [dbField]: newStatus }).eq('id', raw.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } else {
      refetch();
    }
  };

  const handleWeeklyStatusAdd = async (weekStatus: { week: string; status: 'red' | 'amber' | 'green' | 'not-started' }) => {
    if (!raw?.id) return;
    const { error } = await supabase.from('weekly_status').insert({ project_id: raw.id, ...weekStatus });
    if (!error) {
      setWeeklyStatuses(prev => [...prev, { project_id: raw.id, ...weekStatus }]);
    }
  };

  const handleWeeklyStatusUpdate = async (week: string, newStatus: 'red' | 'amber' | 'green' | 'not-started') => {
    if (!raw?.id) return;
    const { error } = await supabase
      .from('weekly_status')
      .update({ status: newStatus })
      .eq('project_id', raw.id)
      .eq('week', week);
    if (!error) {
      setWeeklyStatuses(prev =>
        prev.map(ws => ws.week === week && ws.project_id === raw.id ? { ...ws, status: newStatus } : ws)
      );
    }
  };

  const handleLastCallDateUpdate = async (date: Date) => {
    if (!raw?.id) return;
    setLastCallDate(date);
    const localDate = format(date, 'yyyy-MM-dd');
    const { error } = await supabase
      .from('projects')
      .update({ last_call_date: localDate } as any)
      .eq('id', raw.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update last call date.", variant: "destructive" });
    } else {
      toast({ title: "Last call date updated" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState message="Loading project..." />;

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-600">Project not found.</p>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview',   label: 'Overview',   count: undefined },
    { id: 'project',    label: 'Project',    count: project.monthlyDeliverables.length },
    { id: 'resource',   label: 'Resource',   count: project.teamSize },
    { id: 'escalation', label: 'Escalation', count: project.blockers },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ExecutiveSummary projects={[{
            id: project.id,
            name: project.name,
            status: (project.status === 'not-started' ? 'amber' : project.status) as 'green' | 'amber' | 'red',
            progress: project.progress,
            dueDate: project.dueDate,
            department: project.department,
            lead: project.lead,
            deliverables: project.deliverables,
            completedDeliverables: project.completedDeliverables,
            blockers: project.blockers,
            teamSize: project.teamSize,
            hoursAllocated: project.hoursAllocated,
            hoursUsed: project.hoursUsed,
          }]} />
        );
      case 'project':
        return (
          <MonthlyDeliverables
            projectId={project.id}
            tasks={project.monthlyDeliverables}
            onAddTask={handleAddTask}
            onTaskClick={(task) => { setSelectedTask(task); setIsTaskDetailOpen(true); }}
            onTaskStatusUpdate={handleTaskStatusUpdate}
            onTaskFlag={handleTaskFlag}
            selectedTask={selectedTask}
            isTaskDetailOpen={isTaskDetailOpen}
            setIsTaskDetailOpen={setIsTaskDetailOpen}
          />
        );
      case 'resource':
        return <ResourceOverview projects={[project]} />;
      case 'escalation':
        return <IssuesTracker projects={[project]} defaultProjectId={project.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">

        {/* Back button */}
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        {/* Project header card */}
        <ProjectHeader
          project={{ ...project, lastCallDate }}
          onStatusUpdate={handleStatusUpdate}
          onWeeklyStatusAdd={handleWeeklyStatusAdd}
          onWeeklyStatusUpdate={handleWeeklyStatusUpdate}
          onLeadUpdate={() => {}}
          onLastCallDateUpdate={handleLastCallDateUpdate}
        />

        {/* Tabs + content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <ProjectNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />
          <div className="p-6">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;
