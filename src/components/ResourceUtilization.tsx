import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useProjects } from "@/hooks/useProjects";
import { useAllocations } from "@/hooks/useAllocations";
import { LoadingState } from "@/components/ui/loading-state";

type UtilizationStatus = 'overworked' | 'underworked' | 'optimal';

const STATUS_CFG: Record<UtilizationStatus, { color: string; icon: React.ReactNode; label: string }> = {
  overworked:  { color: 'text-red-600 bg-red-50 border-red-200',    icon: <TrendingUp className="h-3.5 w-3.5" />,   label: 'Overworked' },
  underworked: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <TrendingDown className="h-3.5 w-3.5" />, label: 'Underworked' },
  optimal:     { color: 'text-green-600 bg-green-50 border-green-200', icon: <Clock className="h-3.5 w-3.5" />,       label: 'Optimal' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const ResourceUtilization = () => {
  const { employees, loading: empLoading } = useEmployees();
  const { projects, loading: projLoading } = useProjects();
  const { allocations, loading: allocLoading } = useAllocations();
  const [filter, setFilter] = useState<'all' | UtilizationStatus>('all');

  const utilizationData = useMemo(() => {
    return employees.map(emp => {
      const empAllocs = allocations.filter(a => a.employee_id === emp.id);
      const total = empAllocs.reduce((sum, a) => sum + a.allocation, 0);
      const status: UtilizationStatus = total > 100 ? 'overworked' : total < 60 ? 'underworked' : 'optimal';
      return {
        id: emp.id,
        name: emp.full_name,
        role: emp.position ?? emp.department ?? '—',
        department: emp.department ?? '—',
        total,
        status,
        assignments: empAllocs.map(a => ({
          name: projects.find(p => p.id === a.project_id)?.name ?? 'Unknown',
          allocation: a.allocation,
        })),
      };
    });
  }, [employees, allocations, projects]);

  const filtered = filter === 'all' ? utilizationData : utilizationData.filter(e => e.status === filter);

  const overworkedCount  = utilizationData.filter(e => e.status === 'overworked').length;
  const underworkedCount = utilizationData.filter(e => e.status === 'underworked').length;
  const optimalCount     = utilizationData.filter(e => e.status === 'optimal').length;
  const avgUtilization   = utilizationData.length > 0
    ? Math.round(utilizationData.reduce((sum, e) => sum + e.total, 0) / utilizationData.length)
    : 0;

  if (empLoading || projLoading || allocLoading) {
    return <LoadingState message="Loading utilization data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overworked',   count: overworkedCount,  sub: '>100% allocated',    border: 'border-l-red-500',   icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: 'Underworked',  count: underworkedCount, sub: '<60% allocated',      border: 'border-l-amber-500', icon: <TrendingDown className="w-4 h-4 text-amber-500" /> },
          { label: 'Optimal',      count: optimalCount,     sub: '60–100% allocated',   border: 'border-l-green-500', icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
          { label: 'Avg Utilization', count: `${avgUtilization}%`, sub: 'Team average', border: 'border-l-blue-500',  icon: <Clock className="w-4 h-4 text-blue-500" /> },
        ].map(({ label, count, sub, border, icon }) => (
          <Card key={label} className={`border-l-4 ${border}`}>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
                {icon}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Employee Utilization</h3>
        <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overworked">Overworked</SelectItem>
            <SelectItem value="underworked">Underworked</SelectItem>
            <SelectItem value="optimal">Optimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock className="mx-auto h-10 w-10 mb-2" />
          <p className="text-sm">No employees match this filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(emp => {
            const cfg = STATUS_CFG[emp.status];
            return (
              <Card key={emp.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar>
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-medium">{getInitials(emp.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{emp.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{emp.role}</p>
                      </div>
                    </div>
                    <Badge className={`${cfg.color} flex items-center gap-1 border text-xs shrink-0`}>
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Utilization</span>
                      <span className="font-medium text-slate-700">{emp.total}%</span>
                    </div>
                    <Progress value={Math.min(emp.total, 100)} className="h-2" />
                  </div>

                  {emp.assignments.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Assignments</p>
                      <div className="space-y-1.5">
                        {emp.assignments.map((a, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className={a.name === 'Unknown' ? 'text-amber-600' : 'text-slate-600'}>{a.name}</span>
                            <span className="font-medium text-slate-700">{a.allocation}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
