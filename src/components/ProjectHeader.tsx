import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjectTag } from "@/components/ProjectTag";

interface Project {
  id: string;
  name: string;
  department: string;
  lead: string;
  pmStatus: 'red' | 'amber' | 'green' | 'not-started';
  opsStatus: 'red' | 'amber' | 'green' | 'not-started';
  healthTrend: 'improving' | 'declining' | 'constant';
  pastWeeksStatus: Array<{ week: string; status: 'red' | 'amber' | 'green' | 'not-started' }>;
  monthlyDeliverables?: Array<{ assignee: string; [key: string]: any }>;
  lastCallDate?: Date | null;
}

interface ProjectHeaderProps {
  project: Project;
  onStatusUpdate?: (statusType: 'pmStatus' | 'opsStatus', newStatus: string) => void;
  onWeeklyStatusAdd?: (weekStatus: { week: string; status: 'red' | 'amber' | 'green' | 'not-started' }) => void;
  onWeeklyStatusUpdate?: (week: string, newStatus: 'red' | 'amber' | 'green' | 'not-started') => void;
  onLeadUpdate?: (newLead: string) => void;
  onLastCallDateUpdate?: (date: Date) => void;
}

const STATUS_CFG = {
  green:       { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50',  label: 'Green' },
  amber:       { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50',  label: 'Amber' },
  red:         { dot: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-50',    label: 'Red' },
  'not-started': { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100', label: 'Not Started' },
};

const WEEK_COLORS: Record<string, string> = {
  green: 'bg-green-500 border-green-400',
  amber: 'bg-amber-500 border-amber-400',
  red:   'bg-red-500   border-red-400',
  'not-started': 'bg-slate-300 border-slate-300',
};

const STATUS_CYCLE: ('green' | 'amber' | 'red' | 'not-started')[] = ['green', 'amber', 'red', 'not-started'];

function StatusSelect({
  label, value, onChange,
}: { label: string; value: keyof typeof STATUS_CFG; onChange: (v: string) => void }) {
  const cfg = STATUS_CFG[value] ?? STATUS_CFG['not-started'];
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-8 w-auto gap-1.5 px-3 text-sm font-medium border-0 rounded-full ${cfg.text} ${cfg.bg}`}>
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

export const ProjectHeader = ({
  project, onStatusUpdate, onWeeklyStatusAdd, onWeeklyStatusUpdate, onLastCallDateUpdate,
}: ProjectHeaderProps) => {
  const calculateTrend = (): 'improving' | 'declining' | 'constant' => {
    const sorted = [...project.pastWeeksStatus].sort((a, b) =>
      parseInt(b.week.split('-')[1]) - parseInt(a.week.split('-')[1])
    );
    if (sorted.length < 2) return 'constant';
    const [last, prev] = sorted;
    if ((prev.status === 'red' && last.status !== 'red') || (prev.status === 'amber' && last.status === 'green')) return 'improving';
    if ((prev.status === 'green' && last.status !== 'green') || (prev.status === 'amber' && last.status === 'red')) return 'declining';
    return 'constant';
  };

  const trend = calculateTrend();
  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-600' : 'text-amber-600';
  const trendLabel = trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Stable';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Project identity row */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <ProjectTag id={project.id} name={project.name} className="text-sm h-8 px-4 max-w-lg truncate" />
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {project.department && project.department !== 'Unknown' && (
                <span>{project.department}</span>
              )}
              {project.lead && project.lead !== 'Unassigned' && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>{project.lead}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-sm">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`font-medium ${trendColor}`}>{trendLabel}</span>
            <span className="text-slate-400 text-xs ml-1">health trend</span>
          </div>
        </div>
      </div>

      {/* Status + weekly + last call row */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* PM & Ops Status */}
        <div className="flex gap-6">
          <StatusSelect
            label="PM Status"
            value={project.pmStatus}
            onChange={v => onStatusUpdate?.('pmStatus', v)}
          />
          <StatusSelect
            label="Ops Status"
            value={project.opsStatus}
            onChange={v => onStatusUpdate?.('opsStatus', v)}
          />
        </div>

        {/* Weekly dots */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Weekly Status</p>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map(weekNum => {
              const key = `Week-${weekNum}`;
              const weekData = project.pastWeeksStatus.find(w => w.week === key);
              return (
                <div key={weekNum} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                      weekData ? WEEK_COLORS[weekData.status] : 'bg-slate-100 border-slate-200 border-dashed'
                    )}
                    onClick={() => {
                      if (weekData) {
                        const idx = STATUS_CYCLE.indexOf(weekData.status);
                        onWeeklyStatusUpdate?.(key, STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
                      } else {
                        onWeeklyStatusAdd?.({ week: key, status: 'green' });
                      }
                    }}
                  />
                  <span className="text-xs text-slate-400">W{weekNum}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Call Date */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Call Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-8 justify-start font-normal', !project.lastCallDate && 'text-slate-400')}
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                {project.lastCallDate ? format(project.lastCallDate, 'MMM d, yyyy') : 'Set date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={project.lastCallDate ?? undefined}
                onSelect={date => date && onLastCallDateUpdate?.(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
