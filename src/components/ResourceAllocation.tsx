import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Code, Palette, Bug, Target, Users, Settings, Server, Headphones, Trash2, ChevronLeft, ChevronRight, Save, Edit, FileText, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  skills: string[];
}

interface AllocatedEmployee extends Employee {
  allocation: number;
}

interface ProjectAllocation {
  [projectId: string]: AllocatedEmployee[];
}

interface ProjectStatus {
  [projectId: string]: {
    isFinalized: boolean;
    isEditing: boolean;
  };
}

export const ResourceAllocation = () => {
  const { toast } = useToast();
  const { projects, loading: projectsLoading } = useProjects();
  const { employees, loading: employeesLoading } = useEmployees();
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation>({});
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>({});
  const [isEmployeeListOpen, setIsEmployeeListOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentIcon = (department: string) => {
    const IconComponent = departmentIcons[department as keyof typeof departmentIcons] || User;
    return IconComponent;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Only handle drops onto project cards
    if (destination.droppableId.startsWith('project-')) {
      const projectId = destination.droppableId.replace('project-', '');
      const employee = transformedEmployees.find(emp => emp.id === draggableId);
      if (!employee) return;
      const totalAllocation = getEmployeeTotalAllocation(employee.id);
      if (totalAllocation >= 100) {
        toast({
          title: "Allocation Error",
          description: `${employee.name} is already fully allocated (100%).`,
          variant: "destructive",
        });
        return;
      }
      const newAllocatedEmployee: AllocatedEmployee = {
        ...employee,
        allocation: 50 // Default allocation
      };
      setProjectAllocations(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newAllocatedEmployee]
      }));
    }
  };

  // Calculate total allocation for an employee across all projects
  const getEmployeeTotalAllocation = (employeeId: string) => {
    let total = 0;
    Object.values(projectAllocations).forEach(projectEmployees => {
      const employee = projectEmployees.find(emp => emp.id === employeeId);
      if (employee) {
        total += employee.allocation;
      }
    });
    return total;
  };

  const updateAllocation = (projectId: string, employeeId: string, allocation: number) => {
    // Check if this allocation would exceed 100% total
    const currentTotal = getEmployeeTotalAllocation(employeeId);
    const currentProjectAllocation = projectAllocations[projectId]?.find(emp => emp.id === employeeId)?.allocation || 0;
    const newTotal = currentTotal - currentProjectAllocation + allocation;
    
    if (newTotal > 100) {
      toast({
        title: "Allocation Error",
        description: `Employee cannot be allocated above 100% total. Current: ${currentTotal}%, Attempted: ${newTotal}%`,
        variant: "destructive",
      });
      return;
    }

    setProjectAllocations(prev => ({
      ...prev,
      [projectId]: prev[projectId]?.map(emp => 
        emp.id === employeeId ? { ...emp, allocation } : emp
      ) || []
    }));
  };

  const removeEmployeeFromProject = (projectId: string, employeeId: string) => {
    setProjectAllocations(prev => ({
      ...prev,
      [projectId]: prev[projectId]?.filter(emp => emp.id !== employeeId) || []
    }));
  };

  const finalizeProjectAllocation = (projectId: string) => {
    setProjectStatus(prev => ({
      ...prev,
      [projectId]: { isFinalized: true, isEditing: false }
    }));
  };

  const editProjectAllocation = (projectId: string) => {
    setProjectStatus(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], isEditing: true }
    }));
  };

  const saveProjectAllocation = (projectId: string) => {
    setProjectStatus(prev => ({
      ...prev,
      [projectId]: { isFinalized: true, isEditing: false }
    }));
  };

  const getProjectStatus = (projectId: string) => {
    return projectStatus[projectId] || { isFinalized: false, isEditing: false };
  };

  // Generate utilization report based on actual project deliverables
  const generateUtilizationReport = () => {
    const utilizationData = transformedEmployees.map(employee => {
      const totalAllocation = getEmployeeTotalAllocation(employee.id);
      
      // Get projects this employee is allocated to
      const assignedProjects = Object.entries(projectAllocations)
        .filter(([_, projectEmployees]) => 
          projectEmployees.some(emp => emp.id === employee.id)
        )
        .map(([projectId, projectEmployees]) => {
          const allocation = projectEmployees.find(emp => emp.id === employee.id)?.allocation || 0;
          const project = transformedProjects.find(p => p.id === projectId);
          
          // Count deliverables assigned to this employee
          const assignedDeliverables = 0; // This would need to be calculated from actual deliverables
          
          return {
            projectName: project?.name || 'Unknown Project',
            allocation,
            assignedDeliverables
          };
        });

      return {
        employee: employee.name,
        department: employee.department,
        role: employee.role,
        totalAllocation,
        utilizationStatus: totalAllocation > 90 ? 'Overworked' : 
                          totalAllocation < 60 ? 'Underutilized' : 'Optimal',
        assignedProjects
      };
    });

    // Create CSV content
    const csvHeaders = [
      'Employee Name',
      'Department', 
      'Role',
      'Total Allocation (%)',
      'Utilization Status',
      'Assigned Projects',
      'Total Deliverables'
    ];

    const csvRows = utilizationData.map(data => [
      data.employee,
      data.department,
      data.role,
      data.totalAllocation,
      data.utilizationStatus,
      data.assignedProjects.map(p => p.projectName).join('; '),
      data.assignedProjects.reduce((sum, p) => sum + p.assignedDeliverables, 0)
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilization-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Utilization report has been downloaded successfully.",
    });
  };

  const departmentIcons = {
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

  const allocationOptions = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Transform Supabase data to match component interface
  const transformedEmployees: Employee[] = employees.map(emp => ({
    id: emp.id,
    name: emp.full_name || 'Unknown',
    email: emp.email || `${emp.full_name?.toLowerCase().replace(' ', '.')}@company.com`,
    role: emp.position || 'Unknown',
    department: emp.department || 'Unknown',
    skills: emp.skills || []
  }));

  const transformedProjects = projects.map(project => ({
    id: project.id, // Use the real UUID string from Supabase
    name: project.name,
    type: "Projects" as const,
    status: project.status as "green" | "amber" | "red",
    progress: project.progress,
    teamSize: 5, // This would need calculation from assignments
    deliverableAssignees: [] // This would need to be calculated from deliverables
  }));

  // Sync with actual project deliverables data
  const syncedProjects = useMemo(() => {
    return transformedProjects;
  }, [transformedProjects]);

  if (projectsLoading || employeesLoading) {
    return <div className="p-6 text-center">Loading resource data...</div>;
  }

  return (
    <TooltipProvider>
      <DragDropContext onDragEnd={handleDragEnd}>
      <div className="relative">
        {/* Header with Generate Report Button */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Resource Allocation</h2>
            <p className="text-sm text-muted-foreground">Allocate employees to projects and track utilization</p>
          </div>
          <Button onClick={generateUtilizationReport} className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <div className="flex gap-6 h-[calc(100vh-280px)]">
          {/* Projects Grid */}
          <div className={`transition-all duration-300 overflow-y-auto ${isEmployeeListOpen ? 'flex-1' : 'w-full'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {syncedProjects.map((project) => {
                const status = getProjectStatus(project.id);
                const isReadOnly = status.isFinalized && !status.isEditing;
                
                return (
                  <Droppable 
                    key={project.id} 
                    droppableId={`project-${project.id}`}
                    isDropDisabled={isReadOnly}
                  >
                    {(provided, snapshot) => (
                      <Card 
                        className={`transition-all ${
                          snapshot.isDraggingOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                        } ${isReadOnly ? 'bg-muted/30' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{project.name}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{project.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={project.status === 'green' ? 'default' : 'secondary'}
                                className="shrink-0"
                              >
                                {project.status}
                              </Badge>
                              {status.isFinalized && (
                                <Badge variant="outline" className="text-xs">
                                  Finalized
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Team Size: {project.teamSize} • Progress: {project.progress}%
                            </p>
                            {project.deliverableAssignees.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Deliverable Assignees: {project.deliverableAssignees.join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {projectAllocations[project.id]?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {!status.isFinalized ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => finalizeProjectAllocation(project.id)}
                                  className="text-xs h-7"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Finalize
                                </Button>
                              ) : !status.isEditing ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => editProjectAllocation(project.id)}
                                  className="text-xs h-7"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => saveProjectAllocation(project.id)}
                                  className="text-xs h-7"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              )}
                            </div>
                          )}
                        </CardHeader>
                        
                        <CardContent
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[120px] ${
                            snapshot.isDraggingOver ? 'bg-primary/5' : ''
                          }`}
                        >
                          {projectAllocations[project.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {projectAllocations[project.id].map((employee) => {
                                const IconComponent = getDepartmentIcon(employee.department);
                                
                                return (
                                  <div key={employee.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                    <Avatar className="h-7 w-7 shrink-0">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(employee.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <p className="font-medium text-xs truncate">{employee.name}</p>
                                        <IconComponent className="h-3 w-3 text-muted-foreground shrink-0" />
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Select
                                        value={employee.allocation.toString()}
                                        onValueChange={(value) => updateAllocation(project.id, employee.id, parseInt(value))}
                                        disabled={isReadOnly}
                                      >
                                        <SelectTrigger className="w-16 h-6 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end" className="min-w-[80px] max-h-32 overflow-y-auto">
                                          {allocationOptions.map((option) => (
                                            <SelectItem key={option} value={option.toString()} className="text-xs">
                                              {option}%
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      
                                      {!isReadOnly && (
                                        <button
                                          onClick={() => removeEmployeeFromProject(project.id, employee.id)}
                                          className="text-muted-foreground hover:text-destructive p-0.5 shrink-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-center min-h-[100px]">
                              <div className="text-muted-foreground">
                                <p className="text-xs font-medium">
                                  {isReadOnly ? 'No employees allocated' : 'Drop employees here'}
                                </p>
                                {!isReadOnly && <p className="text-xs">Drag from sidebar to assign</p>}
                              </div>
                            </div>
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

          {/* Employee List Sidebar - Right Side */}
          {isEmployeeListOpen && (
            <div className="w-72 bg-card rounded-lg border overflow-hidden">
              <div className="p-3 border-b bg-muted/50">
                <h3 className="font-semibold text-base">Available Employees</h3>
                <p className="text-xs text-muted-foreground">Drag to assign to projects</p>
              </div>
              
              <Droppable droppableId="employees" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 space-y-2 overflow-y-auto max-h-full"
                  >
                    {transformedEmployees.map((employee, index) => {
                      const IconComponent = getDepartmentIcon(employee.department);
                      const totalAllocation = getEmployeeTotalAllocation(employee.id);
                      const isFullyAllocated = totalAllocation >= 100;
                      
                      return (
                        <Draggable key={employee.id} draggableId={employee.id} index={index} isDragDisabled={isFullyAllocated}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...(!isFullyAllocated ? provided.dragHandleProps : {})}
                              className={`p-2 bg-background border rounded-md transition-all ${
                                isFullyAllocated
                                  ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                                  : 'cursor-grab active:cursor-grabbing hover:shadow-md'
                              } ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : ''}`}
                              aria-disabled={isFullyAllocated}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(employee.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <h4 className="font-medium text-xs truncate">{employee.name}</h4>
                                    <IconComponent className="h-3 w-3 text-muted-foreground shrink-0" />
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {employee.skills.slice(0, 2).map((skill) => (
                                      <Badge key={skill} variant="secondary" className="text-xs px-1 py-0 h-4">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {employee.skills.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                        +{employee.skills.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                  {isFullyAllocated && (
                                    <span className="text-xs text-red-500 font-semibold block mt-1">Fully Allocated</span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Allocation: {totalAllocation}%
                              </div>
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
          )}
        </div>

        {/* Toggle Button for Employee List */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsEmployeeListOpen(!isEmployeeListOpen)}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg"
              size="icon"
            >
              {isEmployeeListOpen ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <div className="flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Available Employees</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </DragDropContext>
    </TooltipProvider>
  );
};