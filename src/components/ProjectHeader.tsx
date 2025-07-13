import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, TrendingUp, TrendingDown, Minus, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  lastCallDate?: Date;
}

interface ProjectHeaderProps {
  project: Project;
  onStatusUpdate?: (statusType: 'pmStatus' | 'opsStatus', newStatus: string) => void;
  onWeeklyStatusAdd?: (weekStatus: { week: string; status: 'red' | 'amber' | 'green' | 'not-started' }) => void;
  onWeeklyStatusUpdate?: (week: string, newStatus: 'red' | 'amber' | 'green' | 'not-started') => void;
  onLeadUpdate?: (newLead: string) => void;
  onLastCallDateUpdate?: (date: Date) => void;
}

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "Green",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  amber: {
    color: "bg-amber-500", 
    label: "Amber",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  red: {
    color: "bg-red-500",
    label: "Red", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  "not-started": {
    color: "bg-slate-500",
    label: "Not Started",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50",
  }
};

const trendConfig = {
  improving: {
    icon: TrendingUp,
    color: "text-green-600",
    label: "Improving"
  },
  declining: {
    icon: TrendingDown,
    color: "text-red-600",
    label: "Declining"
  },
  constant: {
    icon: Minus,
    color: "text-amber-600",
    label: "Constant"
  }
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onStatusUpdate, onWeeklyStatusAdd, onWeeklyStatusUpdate, onLeadUpdate, onLastCallDateUpdate }) => {
  const [newWeekStatus, setNewWeekStatus] = useState<'red' | 'amber' | 'green' | 'not-started'>('green');
  
  // Get unique team members from monthly deliverables
  const getTeamMembers = (): string[] => {
    if (!project.monthlyDeliverables) return [project.lead];
    
    const assignees = project.monthlyDeliverables.map(deliverable => deliverable.assignee);
    const uniqueMembers = [...new Set([project.lead, ...assignees])];
    return uniqueMembers.filter(member => member && member.trim() !== '');
  };
  
  // Calculate health trend based on weekly status changes
  const calculateHealthTrend = (): 'improving' | 'declining' | 'constant' => {
    const sortedWeeks = project.pastWeeksStatus.sort((a, b) => {
      const weekNumA = parseInt(a.week.split('-')[1]);
      const weekNumB = parseInt(b.week.split('-')[1]);
      return weekNumB - weekNumA; // Most recent first
    });

    if (sortedWeeks.length < 2) return 'constant';

    const lastTwoWeeks = sortedWeeks.slice(0, 2);
    const lastWeek = lastTwoWeeks[0];
    const previousWeek = lastTwoWeeks[1];

    // If last two weeks are amber or red, show declining
    if (lastTwoWeeks.every(week => week.status === 'amber' || week.status === 'red')) {
      return 'declining';
    }

    // If status improved from red to amber/green, or from amber to green, show improving
    if (
      (previousWeek.status === 'red' && (lastWeek.status === 'amber' || lastWeek.status === 'green')) ||
      (previousWeek.status === 'amber' && lastWeek.status === 'green')
    ) {
      return 'improving';
    }

    // If status worsened, show declining
    if (
      (previousWeek.status === 'green' && (lastWeek.status === 'amber' || lastWeek.status === 'red')) ||
      (previousWeek.status === 'amber' && lastWeek.status === 'red')
    ) {
      return 'declining';
    }

    return 'constant';
  };

  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const calculatedTrend = calculateHealthTrend();
  const trendData = trendConfig[calculatedTrend];
  const TrendIcon = trendData.icon;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      {/* Notebook Header - Rings/Binding Effect */}
      <div className="bg-slate-100 border-b border-slate-200 p-1">
        <div className="flex justify-center space-x-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-slate-300 shadow-inner"></div>
          ))}
        </div>
      </div>

      {/* Project Header */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{project.department}</Badge>
              <Select value={project.lead} onValueChange={(newLead: string) => onLeadUpdate?.(newLead)}>
                <SelectTrigger className="w-auto min-w-[120px] bg-transparent border-none hover:bg-slate-100 p-1 h-auto">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                  {getTeamMembers().map((member) => (
                    <SelectItem key={member} value={member} className="hover:bg-slate-100">
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <TrendIcon className={`w-5 h-5 ${trendData.color}`} />
              <span className={`text-sm font-medium ${trendData.color}`}>
                {trendData.label}
              </span>
            </div>
            <div className="text-xs text-slate-500">Health Trend (2 weeks)</div>
          </div>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">PM Status</div>
            <Select value={project.pmStatus} onValueChange={(newStatus: any) => onStatusUpdate?.('pmStatus', newStatus)}>
              <SelectTrigger className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pmConfig.bgColor} ${pmConfig.textColor} border-none hover:bg-opacity-80 w-auto`}>
                <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
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
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Ops Status</div>
            <Select value={project.opsStatus} onValueChange={(newStatus: any) => onStatusUpdate?.('opsStatus', newStatus)}>
              <SelectTrigger className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${opsConfig.bgColor} ${opsConfig.textColor} border-none hover:bg-opacity-80 w-auto`}>
                <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
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
        </div>

        {/* Weekly Status Management */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Weekly Status Management</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(
                  "h-8 justify-start text-left font-normal",
                  !project.lastCallDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {project.lastCallDate ? format(project.lastCallDate, "PPP") : "Last Call Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={project.lastCallDate}
                  onSelect={(date) => date && onLastCallDateUpdate?.(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((weekNum) => {
              const weekData = project.pastWeeksStatus.find(w => w.week === `Week-${weekNum}`);
              return (
                <div key={weekNum} className="space-y-2">
                  <div className="text-xs font-medium text-slate-600">Week-{weekNum}</div>
                  {weekData ? (
                    <div 
                      className={`w-6 h-6 rounded-full border-2 border-dashed cursor-pointer hover:scale-110 transition-transform ${
                        weekData.status === 'green' ? 'bg-green-500 border-green-300' :
                        weekData.status === 'amber' ? 'bg-amber-500 border-amber-300' :
                        weekData.status === 'red' ? 'bg-red-500 border-red-300' :
                        'bg-slate-500 border-slate-300'
                      }`}
                      onClick={() => {
                        const statusCycle: ('green' | 'amber' | 'red' | 'not-started')[] = ['green', 'amber', 'red', 'not-started'];
                        const currentIndex = statusCycle.indexOf(weekData.status);
                        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                        onWeeklyStatusUpdate?.(weekData.week, nextStatus);
                      }}
                    ></div>
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => onWeeklyStatusAdd?.({ week: `Week-${weekNum}`, status: 'green' })}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};