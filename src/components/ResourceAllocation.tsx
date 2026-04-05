import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Code, Palette, Bug, Target, Users, Settings, Server, Headphones, Trash2, FileText } from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { useAllocations } from "@/hooks/useAllocations";
import { LoadingState } from "@/components/ui/loading-state";

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Developer: Code,
  Designer: Palette,
  QA: Bug,
  PM: Target,
  HR: Users,
  Ops: Settings,
  Admin: Settings,
  Devops: Server,
  'L1 support': Headphones,
};

const ALLOCATION_OPTIONS = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

const STATUS_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  'not-started': 'bg-slate-100 text-slate-600',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const ResourceAllocation = () => {
  const { toast } = useToast();
  const { projects, loading: projectsLoading } = useProjects();
  const { employees, loading: employeesLoading } = useEmployees();
  const { allocations, loading: allocationsLoading, upsert, remove, getProjectAllocations, getEmployeeTotalAllocation } = useAllocations();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination?.droppableId.startsWith('project-')) return;

    const projectId = destination.droppableId.replace('project-', '');
    const employee = employees.find(e => e.id === draggableId);
    if (!employee) return;

    // Already allocated to this project
    if (allocations.some(a => a.project_id === projectId && a.employee_id === draggableId)) return;

    const total = getEmployeeTotalAllocation(draggableId);
    if (total >= 100) {
      toast({ title: "Can't allocate", description: `${employee.full_name} is already at 100% allocation.`, variant: "destructive" });
      return;
    }

    const defaultAlloc = Math.min(50, 100 - total);
    const error = await upsert(projectId, draggableId, defaultAlloc);
    if (error) toast({ title: "Error", description: "Failed to save allocation.", variant: "destructive" });
  };

  const handleAllocationChange = async (projectId: string, employeeId: string, newAlloc: number) => {
    const currentAlloc = allocations.find(a => a.project_id === projectId && a.employee_id === employeeId)?.allocation ?? 0;
    const total = getEmployeeTotalAllocation(employeeId);
    const newTotal = total - currentAlloc + newAlloc;

    if (newTotal > 100) {
      toast({ title: "Over capacity", description: `Total would be ${newTotal}%. Max is 100%.`, variant: "destructive" });
      return;
    }

    const error = await upsert(projectId, employeeId, newAlloc);
    if (error) toast({ title: "Error", description: "Failed to update allocation.", variant: "destructive" });
  };

  const handleRemove = async (projectId: string, employeeId: string) => {
    const error = await remove(projectId, employeeId);
    if (error) toast({ title: "Error", description: "Failed to remove allocation.", variant: "destructive" });
  };

  const generateReport = () => {
    const rows = employees.map(emp => {
      const total = getEmployeeTotalAllocation(emp.id);
      const assigned = allocations
        .filter(a => a.employee_id === emp.id)
        .map(a => {
          const p = projects.find(p => p.id === a.project_id);
          return `${p?.name ?? 'Unknown'}(${a.allocation}%)`;
        }).join('; ');
      return [emp.full_name, emp.department ?? '', emp.position ?? '', total, assigned].join(',');
    });
    const csv = ['Name,Department,Role,Total Allocation,Projects', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allocation-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded" });
  };

  if (projectsLoading || employeesLoading || allocationsLoading) {
    return <LoadingState message="Loading resource data..." />;
  }

  return (
    <TooltipProvider>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Resource Allocation</h2>
              <p className="text-sm text-slate-500">Drag employees from the sidebar onto projects to allocate</p>
            </div>
            <Button variant="outline" size="sm" onClick={generateReport} className="gap-2">
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="flex gap-5">
            {/* Projects grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map(project => {
                  const projectAllocs = getProjectAllocations(project.id);
                  const statusColor = STATUS_COLORS[project.pm_status?.toLowerCase()] ?? STATUS_COLORS['not-started'];

                  return (
                    <Droppable key={project.id} droppableId={`project-${project.id}`}>
                      {(provided, snapshot) => (
                        <Card className={`transition-all ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm font-semibold leading-tight">{project.name}</CardTitle>
                              <Badge className={`text-xs shrink-0 border-0 ${statusColor}`}>
                                {project.pm_status ?? 'n/a'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">{project.progress ?? 0}% complete · {projectAllocs.length} allocated</p>
                          </CardHeader>

                          <CardContent
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="min-h-[90px] space-y-2"
                          >
                            {projectAllocs.length === 0 ? (
                              <div className={`flex items-center justify-center h-[80px] rounded-md border-2 border-dashed text-xs text-slate-400 transition-colors ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-slate-200'}`}>
                                Drop employees here
                              </div>
                            ) : (
                              projectAllocs.map(alloc => {
                                const emp = employees.find(e => e.id === alloc.employee_id);
                                if (!emp) return null;
                                const Icon = DEPARTMENT_ICONS[emp.department ?? ''] ?? User;
                                return (
                                  <div key={alloc.employee_id} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-md border border-slate-100">
                                    <Avatar className="h-6 w-6 shrink-0">
                                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{getInitials(emp.full_name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{emp.full_name}</p>
                                      <div className="flex items-center gap-1 text-slate-400">
                                        <Icon className="h-2.5 w-2.5" />
                                        <span className="text-xs">{emp.position ?? emp.department}</span>
                                      </div>
                                    </div>
                                    <Select
                                      value={alloc.allocation.toString()}
                                      onValueChange={v => handleAllocationChange(project.id, alloc.employee_id, parseInt(v))}
                                    >
                                      <SelectTrigger className="h-6 w-16 text-xs px-1.5">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent align="end" className="min-w-[70px]">
                                        {ALLOCATION_OPTIONS.map(o => (
                                          <SelectItem key={o} value={o.toString()} className="text-xs">{o}%</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <button
                                      onClick={() => handleRemove(project.id, alloc.employee_id)}
                                      className="text-slate-300 hover:text-red-500 transition-colors p-0.5 shrink-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                            {provided.placeholder}
                          </CardContent>
                        </Card>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>

            {/* Employee sidebar - always visible */}
            <div className="w-64 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700">Employees</h3>
                <p className="text-xs text-slate-400">Drag onto a project to allocate</p>
              </div>

              <Droppable droppableId="employees" isDropDisabled>
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {employees.map((emp, index) => {
                      const total = getEmployeeTotalAllocation(emp.id);
                      const full = total >= 100;
                      const Icon = DEPARTMENT_ICONS[emp.department ?? ''] ?? User;

                      return (
                        <Draggable key={emp.id} draggableId={emp.id} index={index} isDragDisabled={full}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 rounded-lg border transition-all select-none ${
                                full
                                  ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                                  : snapshot.isDragging
                                  ? 'shadow-lg scale-105 bg-white border-blue-300 cursor-grabbing'
                                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-grab'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="text-xs bg-blue-50 text-blue-600">{getInitials(emp.full_name)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">{emp.full_name}</p>
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 text-slate-400 min-w-0">
                                      <Icon className="h-2.5 w-2.5 shrink-0" />
                                      <span className="text-xs truncate">{emp.department}</span>
                                    </div>
                                    <span className={`text-xs font-medium shrink-0 ${total > 80 ? 'text-red-500' : total > 60 ? 'text-amber-500' : 'text-green-600'}`}>
                                      {total}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {full && <p className="text-xs text-red-400 mt-1 font-medium">Fully allocated</p>}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </TooltipProvider>
  );
};
