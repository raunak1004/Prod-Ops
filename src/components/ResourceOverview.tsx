import { useMemo } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAllocations } from "@/hooks/useAllocations";

interface Project {
  id: string;
  name: string;
  [key: string]: any;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const ResourceOverview = ({ projects }: { projects: Project[] }) => {
  const project = projects[0];
  const { employees } = useEmployees();
  const { getProjectAllocations } = useAllocations();

  const team = useMemo(() => {
    if (!project) return [];
    return getProjectAllocations(project.id)
      .map(a => {
        const emp = employees.find(e => e.id === a.employee_id);
        return emp ? { ...emp, allocation: a.allocation } : null;
      })
      .filter((e): e is NonNullable<typeof e> => !!e)
      .sort((a, b) => b.allocation - a.allocation);
  }, [project, employees, getProjectAllocations]);

  // Group by department
  const byDept = useMemo(() => {
    return team.reduce<Record<string, typeof team>>((acc, emp) => {
      const dept = emp.department ?? 'Other';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(emp);
      return acc;
    }, {});
  }, [team]);

  if (!project) return null;

  if (team.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Users className="w-10 h-10" />
        <p className="text-sm font-medium">No team members allocated yet</p>
        <p className="text-xs text-center max-w-xs">
          Go to <span className="font-semibold text-slate-600">Resource → Allocation</span> and drag employees onto this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Team Size', value: team.length },
          { label: 'Departments', value: Object.keys(byDept).length },
          { label: 'Avg Allocation', value: `${Math.round(team.reduce((s, e) => s + e.allocation, 0) / team.length)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 bg-white rounded-xl border border-slate-100 text-center">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Team by department */}
      {Object.entries(byDept).map(([dept, members]) => (
        <div key={dept} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{dept}</p>
            <Badge variant="secondary" className="text-xs">{members.length} {members.length === 1 ? 'member' : 'members'}</Badge>
          </div>
          <div className="divide-y divide-slate-50">
            {members.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-blue-50 text-blue-700 font-medium">
                    {getInitials(emp.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{emp.full_name}</p>
                  {emp.position && <p className="text-xs text-slate-400 truncate">{emp.position}</p>}
                </div>
                <div className="shrink-0 w-28 flex items-center gap-2">
                  <Progress value={emp.allocation} className="h-1.5 flex-1" />
                  <span className={`text-xs font-semibold w-8 text-right ${emp.allocation >= 80 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {emp.allocation}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
