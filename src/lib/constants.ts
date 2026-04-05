export type ProjectStatus = 'green' | 'amber' | 'red' | 'not-started';

export const STATUS_MAP: Record<string, ProjectStatus> = {
  active: 'green',
  completed: 'green',
  green: 'green',
  planning: 'amber',
  pending: 'amber',
  amber: 'amber',
  'on-hold': 'red',
  cancelled: 'red',
  red: 'red',
  'not-started': 'not-started',
};

export const KEKA_TO_DB_STATUS: Record<string, string> = {
  active: 'active',
  completed: 'completed',
  'on-hold': 'on-hold',
  cancelled: 'cancelled',
  'not-started': 'not-started',
};
