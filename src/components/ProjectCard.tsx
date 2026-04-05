import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pencil, CalendarDays, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ProjectTag } from "@/components/ProjectTag";

interface Project {
  id: string;
  name: string;
  status: "green" | "amber" | "red" | "not-started";
  progress: number;
  dueDate: string;
  department: string;
  lead: any;
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
  lastCallDate: string;
  pmStatus: "green" | "amber" | "red" | "not-started";
  opsStatus: "green" | "amber" | "red" | "not-started";
  monthlyDeliverables: Array<{ id: number; task: string; dueDate: string; comments: string }>;
}

interface ProjectCardProps {
  project: Project;
  onStatusUpdate?: (projectId: string, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => void;
  onEdit?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

const STATUS = {
  green:       { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-l-green-500',  label: 'Green' },
  amber:       { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-l-amber-500',  label: 'Amber' },
  red:         { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-l-red-500',    label: 'Red' },
  'not-started': { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50',  border: 'border-l-slate-300',  label: 'Not Started' },
};

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: keyof typeof STATUS;
  onChange: (v: string) => void;
}) {
  const cfg = STATUS[value] ?? STATUS['not-started'];
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs font-medium text-slate-500 shrink-0">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`h-6 w-auto gap-1 px-2 text-xs font-medium border-0 ${cfg.text} ${cfg.bg} hover:opacity-80 focus:ring-0 text-justify-start`}
          // onClick={e => e.stopPropagation()}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="amber">Amber</SelectItem>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="not-started">Not Started</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const ProjectCard = ({ project, onStatusUpdate, onEdit, onClick, isSelected }: ProjectCardProps) => {
  const navigate = useNavigate();
  const cfg = STATUS[project.status] ?? STATUS['not-started'];

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-nav]')) return;
    onClick ? onClick() : navigate(`/project/${project.id}`);
  };

  const formattedDue = project.dueDate
    ? format(new Date(project.dueDate), 'MMM d, yyyy')
    : null;

  return (
    <Card
      className={`border-l-4 ${cfg.border} hover:shadow-md transition-shadow duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 space-y-3">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <ProjectTag id={project.id} name={project.name} className="max-w-full truncate text-xs h-7 px-3" />
          </div>
          <Button
            data-no-nav
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-700 -mt-0.5 -mr-1"
            onClick={e => { e.stopPropagation(); onEdit?.(); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* ── Status row ── */}
        <div className="flex items-center gap-4" data-no-nav>
          <StatusSelect
            label="PM"
            value={project.pmStatus}
            onChange={v => onStatusUpdate?.(project.id, 'pmStatus', v)}
          />
          <StatusSelect
            label="Ops"
            value={project.opsStatus}
            onChange={v => onStatusUpdate?.(project.id, 'opsStatus', v)}
          />
        </div>

        {/* ── Progress bar ── */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-medium text-slate-700">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                project.progress >= 70 ? 'bg-green-500' :
                project.progress >= 40 ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* ── Footer stats ── */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{project.completedDeliverables}/{project.deliverables} deliverables</span>
          </div>
          {formattedDue && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formattedDue}</span>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};
