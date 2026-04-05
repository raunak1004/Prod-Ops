import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ProjectFilterState {
  search: string;
  pmStatus: string;
  opsStatus: string;
}

export const DEFAULT_FILTERS: ProjectFilterState = {
  search: '',
  pmStatus: 'all',
  opsStatus: 'all',
};

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onChange: (filters: ProjectFilterState) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'red', label: 'Red' },
  { value: 'not-started', label: 'Not Started' },
];

export function ProjectFilters({ filters, onChange }: ProjectFiltersProps) {
  const update = (key: keyof ProjectFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasActive =
    filters.search !== '' ||
    filters.pmStatus !== 'all' ||
    filters.opsStatus !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search projects..."
        value={filters.search}
        onChange={e => update('search', e.target.value)}
        className="h-9 w-52"
      />

      <Select value={filters.pmStatus} onValueChange={v => update('pmStatus', v)}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="PM Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value}>
              PM: {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.opsStatus} onValueChange={v => update('opsStatus', v)}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Ops Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value}>
              Ops: {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-slate-500 hover:text-slate-700"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
