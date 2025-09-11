import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTag } from '@/components/ProjectTag';

type Project = {
  id: string;
  name: string;
  progress?: number | null;
};

type Task = {
  id: string;
  project_id: string | null;
  completed_at: string | null;
};

type Allocation = {
  id: string;
  project_id: string;
  employee_id: string;
  allocation: number; // percent 0-100
};

type SlideData = {
  month: string;
  estimated: number;
  actual: number;
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameMonth(dateStr: string, year: number, monthIndex: number) {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

export const ProjectHoursCarousel: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  // Auto-advance every 4s
  const carouselApiRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      const api = carouselApiRef.current;
      if (api) {
        api.scrollNext();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch base data
  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: t }, { data: a }] = await Promise.all([
        supabase.from('projects').select('id, name, progress').order('created_at', { ascending: false }),
        supabase.from('tasks').select('id, project_id, completed_at'),
        supabase.from('allocations').select('id, project_id, employee_id, allocation')
      ]);
      setProjects(p || []);
      setTasks(t || []);
      setAllocations(a || []);
    };
    load();

    // Realtime updates
    const channel = supabase
      .channel('project-hours-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        supabase.from('projects').select('id, name, progress').then(({ data }) => setProjects(data || []));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase.from('tasks').select('id, project_id, completed_at').then(({ data }) => setTasks(data || []));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allocations' }, () => {
        supabase.from('allocations').select('id, project_id, employee_id, allocation').then(({ data }) => setAllocations(data || []));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const hoursPerMonthFromAllocations = useMemo(() => {
    // Sum allocation percents for each project; assume 40h/week * 4.33 weeks/month
    const PER_MONTH = 40 * 4.33;
    const byProject: Record<string, number> = {};
    for (const a of allocations) {
      byProject[a.project_id] = (byProject[a.project_id] || 0) + (a.allocation / 100) * PER_MONTH;
    }
    return byProject;
  }, [allocations]);

  const slidesByProject: Record<string, SlideData[]> = useMemo(() => {
    const result: Record<string, SlideData[]> = {};
    for (const project of projects) {
      const estimatedPerMonth = Math.round((hoursPerMonthFromAllocations[project.id] || 0));
      const months: SlideData[] = MONTH_LABELS.map((label, idx) => {
        // Actual hours = completed tasks in month * 8h
        const completedTasks = tasks.filter(
          t => t.project_id === project.id && t.completed_at && isSameMonth(t.completed_at, currentYear, idx)
        );
        const actual = completedTasks.length * 8;
        return { month: label, estimated: estimatedPerMonth, actual };
      });
      result[project.id] = months;
    }
    return result;
  }, [projects, tasks, hoursPerMonthFromAllocations, currentYear]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Hours: Estimated vs Actual (Real-time)</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{ loop: true, align: 'start' }}
          setApi={(api) => (carouselApiRef.current = api)}
        >
          <CarouselContent>
            {projects.map((p) => (
              <CarouselItem key={p.id}>
                <div className="p-2">
                  <div className="mb-3">
                    <ProjectTag id={p.id} name={p.name} />
                  </div>
                  <ChartContainer
                    config={{
                      estimated: { label: 'Estimated Hours', color: 'hsl(24, 95%, 53%)' },
                      actual: { label: 'Actual Hours', color: 'hsl(262, 83%, 58%)' },
                    }}
                  >
                    <ResponsiveContainer>
                      <LineChart data={slidesByProject[p.id] || []} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="estimated" stroke="var(--color-estimated)" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default ProjectHoursCarousel;


