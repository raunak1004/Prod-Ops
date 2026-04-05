import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTag } from '@/components/ProjectTag';

type Project    = { id: string; name: string; progress?: number | null };
type Task       = { id: string; project_id: string | null; completed_at: string | null };
type Allocation = { id: string; project_id: string; employee_id: string; allocation: number };

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isSameMonth(dateStr: string, year: number, monthIndex: number) {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

const CHART_CFG = {
  estimated: { label: 'Estimated', color: 'hsl(24 95% 53%)' },
  actual:    { label: 'Actual',    color: 'hsl(262 83% 58%)' },
};

const ProjectHoursCarousel = () => {
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: t }, { data: a }] = await Promise.all([
        supabase.from('projects').select('id, name, progress').order('created_at', { ascending: false }),
        supabase.from('tasks').select('id, project_id, completed_at'),
        supabase.from('allocations').select('id, project_id, employee_id, allocation'),
      ]);
      setProjects(p || []);
      setTasks(t || []);
      setAllocations(a || []);
    };
    load();

    const channel = supabase.channel('project-hours-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },    () => supabase.from('projects').select('id, name, progress').then(({ data }) => setProjects(data || [])))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },       () => supabase.from('tasks').select('id, project_id, completed_at').then(({ data }) => setTasks(data || [])))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allocations' }, () => supabase.from('allocations').select('id, project_id, employee_id, allocation').then(({ data }) => setAllocations(data || [])))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const currentYear = new Date().getFullYear();

  const estByProject = useMemo(() => {
    const PER_MONTH = 40 * 4.33;
    const byProject: Record<string, number> = {};
    for (const a of allocations) {
      byProject[a.project_id] = (byProject[a.project_id] || 0) + (a.allocation / 100) * PER_MONTH;
    }
    return byProject;
  }, [allocations]);

  const chartsByProject = useMemo(() => {
    return projects.map(p => ({
      project: p,
      data: MONTH_LABELS.map((month, idx) => {
        const estimated = Math.round(estByProject[p.id] || 0);
        const actual    = tasks.filter(t => t.project_id === p.id && t.completed_at && isSameMonth(t.completed_at, currentYear, idx)).length * 8;
        return { month, estimated, actual };
      }),
    }));
  }, [projects, tasks, estByProject, currentYear]);

  if (projects.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-slate-800">Monthly Hours — Estimated vs Actual</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {chartsByProject.map(({ project, data }) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <ProjectTag id={project.id} name={project.name} className="text-xs h-7 px-3 max-w-full truncate" />
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ChartContainer config={CHART_CFG} className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="estimated" stroke="var(--color-estimated)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="actual"    stroke="var(--color-actual)"    strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectHoursCarousel;
