import { Project, Deliverable, Issue } from '@/hooks/useProjects';
import { STATUS_MAP, ProjectStatus } from './constants';

export interface TransformedProject {
  id: string;
  name: string;
  type: 'Projects';
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  department: string;
  lead: string;
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
  lastCallDate: string;
  pmStatus: ProjectStatus;
  opsStatus: ProjectStatus;
  healthTrend: 'constant';
  monthlyDeliverables: never[];
  pastWeeksStatus: never[];
}

export function transformProject(
  project: Project,
  deliverables: Deliverable[],
  issues: Issue[]
): TransformedProject {
  const projectDeliverables = deliverables.filter(d => d.project_id === project.id);
  const completedDeliverables = projectDeliverables.filter(
    d => d.status === 'completed' || d.status === 'done'
  ).length;
  const blockers = issues.filter(
    i => i.project_id === project.id && i.status === 'open' && i.severity === 'high'
  ).length;
  const teamSize = new Set(
    projectDeliverables.map(d => d.assignee_name).filter(Boolean)
  ).size;

  return {
    id: project.id,
    name: project.name,
    type: 'Projects',
    status: STATUS_MAP[project.status?.toLowerCase()] ?? 'not-started',
    progress: project.progress,
    dueDate: project.end_date ?? '',
    department: project.manager?.department ?? 'Unknown',
    lead: project.manager?.full_name ?? 'Unassigned',
    deliverables: projectDeliverables.length,
    completedDeliverables,
    blockers,
    teamSize,
    hoursAllocated: 0,
    hoursUsed: 0,
    lastCallDate: project.updated_at ?? '',
    pmStatus: STATUS_MAP[project.pm_status?.toLowerCase()] ?? 'not-started',
    opsStatus: STATUS_MAP[project.ops_status?.toLowerCase()] ?? 'not-started',
    healthTrend: 'constant',
    monthlyDeliverables: [],
    pastWeeksStatus: [],
  };
}
