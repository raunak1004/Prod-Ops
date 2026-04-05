import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmployeesList } from "@/components/EmployeesList";
import { ResourceUtilization } from "@/components/ResourceUtilization";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { useAllocations } from "@/hooks/useAllocations";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Users, Briefcase, TrendingUp, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const Resources = () => {
  const { projects, loading: projLoading, error } = useProjects();
  const { employees, loading: empLoading } = useEmployees();
  const { allocations, loading: allocLoading } = useAllocations();

  const loading = projLoading || empLoading || allocLoading;

  // Portfolio-level stats
  const stats = useMemo(() => {
    const allocatedEmployeeIds = new Set(allocations.map(a => a.employee_id));
    const projectsWithTeam = new Set(allocations.map(a => a.project_id)).size;
    const totalAlloc = employees.length > 0
      ? Math.round(
          employees.map(emp => allocations.filter(a => a.employee_id === emp.id).reduce((s, a) => s + a.allocation, 0))
                   .reduce((s, v) => s + v, 0) / employees.length
        )
      : 0;
    return {
      totalEmployees: employees.length,
      allocatedEmployees: allocatedEmployeeIds.size,
      projectsWithTeam,
      avgUtilization: totalAlloc,
    };
  }, [employees, allocations]);

  // Department breakdown
  const deptBreakdown = useMemo(() => {
    const map: Record<string, { total: number; allocated: number; avgAlloc: number; totalAlloc: number }> = {};
    for (const emp of employees) {
      const dept = emp.department ?? 'Other';
      if (!map[dept]) map[dept] = { total: 0, allocated: 0, avgAlloc: 0, totalAlloc: 0 };
      map[dept].total++;
      const empTotal = allocations.filter(a => a.employee_id === emp.id).reduce((s, a) => s + a.allocation, 0);
      if (empTotal > 0) map[dept].allocated++;
      map[dept].totalAlloc += empTotal;
    }
    return Object.entries(map)
      .map(([dept, d]) => ({ dept, ...d, avgAlloc: d.total > 0 ? Math.round(d.totalAlloc / d.total) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [employees, allocations]);

  // Allocation health: over/under/optimal
  const allocationHealth = useMemo(() => {
    return employees.map(emp => {
      const total = allocations.filter(a => a.employee_id === emp.id).reduce((s, a) => s + a.allocation, 0);
      return { emp, total };
    }).filter(e => e.total > 0);
  }, [employees, allocations]);

  const overAllocated  = allocationHealth.filter(e => e.total > 100);
  const highAllocated  = allocationHealth.filter(e => e.total >= 80 && e.total <= 100);
  const lowAllocated   = allocationHealth.filter(e => e.total > 0 && e.total < 50);

  // Per-project team summary
  const projectSummaries = useMemo(() => {
    return projects.map(p => {
      const projAllocs = allocations.filter(a => a.project_id === p.id);
      const members = projAllocs.map(a => {
        const emp = employees.find(e => e.id === a.employee_id);
        return emp ? { ...emp, allocation: a.allocation } : null;
      }).filter(Boolean) as (typeof employees[0] & { allocation: number })[];
      const depts = [...new Set(members.map(m => m.department).filter(Boolean))];
      const avgAlloc = members.length > 0
        ? Math.round(members.reduce((s, m) => s + m.allocation, 0) / members.length)
        : 0;
      return { project: p, members, depts, avgAlloc };
    }).filter(s => s.members.length > 0);
  }, [projects, allocations, employees]);

  if (loading) return <LoadingState message="Loading resources..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && <ErrorBanner message={error} />}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-500 mt-1">Monitor and optimize resource allocation across projects</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
          </TabsList>

          {/* ── Overview ─────────────────────────────────── */}
          <TabsContent value="overview" className="mt-6 space-y-6">

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Employees', value: stats.totalEmployees, sub: 'in your org', icon: <Users className="w-4 h-4 text-blue-500" />, border: 'border-l-blue-500' },
                { label: 'Allocated', value: stats.allocatedEmployees, sub: 'across projects', icon: <Briefcase className="w-4 h-4 text-green-500" />, border: 'border-l-green-500' },
                { label: 'Active Projects', value: stats.projectsWithTeam, sub: 'with team assigned', icon: <BarChart3 className="w-4 h-4 text-purple-500" />, border: 'border-l-purple-500' },
                { label: 'Avg Utilization', value: `${stats.avgUtilization}%`, sub: 'across all employees', icon: <TrendingUp className="w-4 h-4 text-amber-500" />, border: 'border-l-amber-500' },
              ].map(({ label, value, sub, icon, border }) => (
                <Card key={label} className={`border-l-4 ${border}`}>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                      {icon}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Department breakdown + Allocation health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Department breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">Department Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deptBreakdown.slice(0, 8).map(({ dept, total, allocated, avgAlloc }) => (
                    <div key={dept}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-800 truncate">{dept}</span>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                          <span>{allocated}/{total} allocated</span>
                          <span className={`font-semibold w-10 text-right ${avgAlloc > 80 ? 'text-amber-600' : avgAlloc > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {avgAlloc}%
                          </span>
                        </div>
                      </div>
                      <Progress value={avgAlloc} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Allocation health */}
              <div className="space-y-4">
                {/* Over-allocated */}
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Over-allocated ({overAllocated.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overAllocated.length === 0 ? (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> None — all within limits</p>
                    ) : (
                      <div className="space-y-2">
                        {overAllocated.slice(0, 4).map(({ emp, total }) => (
                          <div key={emp.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarFallback className="text-xs bg-red-50 text-red-700">{getInitials(emp.full_name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-700 flex-1 truncate">{emp.full_name}</span>
                            <Badge className="text-xs bg-red-50 text-red-700 border-0">{total}%</Badge>
                          </div>
                        ))}
                        {overAllocated.length > 4 && <p className="text-xs text-slate-400">+{overAllocated.length - 4} more</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* At capacity */}
                <Card className="border-l-4 border-l-amber-400">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> At capacity ({highAllocated.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {highAllocated.length === 0 ? (
                      <p className="text-xs text-slate-400">No employees at high allocation</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {highAllocated.slice(0, 6).map(({ emp, total }) => (
                          <div key={emp.id} className="flex items-center gap-1.5 bg-amber-50 rounded-full px-2 py-0.5">
                            <Avatar className="h-4 w-4 shrink-0">
                              <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700">{getInitials(emp.full_name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-700">{emp.full_name.split(' ')[0]}</span>
                            <span className="text-xs font-semibold text-amber-600">{total}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Project team allocation grid */}
            {projectSummaries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm font-medium">No team allocations yet</p>
                  <p className="text-xs mt-1">Go to the Allocation tab to assign employees to projects.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-800">Project Teams</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {projectSummaries.map(({ project, members, depts, avgAlloc }) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                            {project.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs shrink-0">{members.length} {members.length === 1 ? 'member' : 'members'}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {depts.map(d => (
                            <Badge key={d} className="text-xs bg-slate-100 text-slate-600 border-0 font-normal">{d}</Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Avg allocation bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Avg allocation</span>
                            <span className={`font-medium ${avgAlloc > 80 ? 'text-amber-600' : 'text-slate-600'}`}>{avgAlloc}%</span>
                          </div>
                          <Progress value={avgAlloc} className="h-1.5" />
                        </div>
                        {/* Member avatars */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {members.slice(0, 6).map(m => (
                            <div key={m.id} title={`${m.full_name} — ${m.allocation}%`}>
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-blue-50 text-blue-700 font-medium">
                                  {getInitials(m.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                          {members.length > 6 && (
                            <span className="text-xs text-slate-400 ml-1">+{members.length - 6} more</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Employees ────────────────────────────────── */}
          <TabsContent value="employees" className="mt-6">
            <EmployeesList />
          </TabsContent>

          {/* ── Allocation ───────────────────────────────── */}
          <TabsContent value="allocation" className="mt-6">
            <ResourceAllocation />
          </TabsContent>

          {/* ── Utilization ──────────────────────────────── */}
          <TabsContent value="utilization" className="mt-6">
            <ResourceUtilization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
