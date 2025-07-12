import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Code, Palette, Bug, Target, Users, Settings, Server, Headphones, Trash2, ChevronLeft, ChevronRight, Save, Edit, FileText, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { projectsAndProducts } from "@/data/projectsData";

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

// Mock employees data
const mockEmployees: Employee[] = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Senior Developer', department: 'Developer', skills: ['React', 'TypeScript', 'Node.js'] },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'UI/UX Designer', department: 'Designer', skills: ['Figma', 'Adobe XD', 'Sketch'] },
  { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'QA Engineer', department: 'QA', skills: ['Selenium', 'Jest', 'Cypress'] },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@company.com', role: 'Project Manager', department: 'PM', skills: ['Agile', 'Scrum', 'Jira'] },
  { id: '5', name: 'Alex Brown', email: 'alex@company.com', role: 'DevOps Engineer', department: 'Devops', skills: ['Docker', 'Kubernetes', 'AWS'] },
  { id: '6', name: 'Lisa Garcia', email: 'lisa@company.com', role: 'Frontend Developer', department: 'Developer', skills: ['Vue.js', 'CSS', 'JavaScript'] },
  { id: '7', name: 'Tom Davis', email: 'tom@company.com', role: 'Backend Developer', department: 'Developer', skills: ['Python', 'Django', 'PostgreSQL'] },
  { id: '8', name: 'Emma Wilson', email: 'emma@company.com', role: 'Product Designer', department: 'Designer', skills: ['User Research', 'Prototyping', 'Design Systems'] },
];

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

export const ResourceAllocation = () => {
  const { toast } = useToast();
  const [employees] = useState<Employee[]>(mockEmployees);
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
      const employee = employees.find(emp => emp.id === draggableId);
      
      if (employee) {
        const newAllocatedEmployee: AllocatedEmployee = {
          ...employee,
          allocation: 50 // Default allocation
        };

        setProjectAllocations(prev => ({
          ...prev,
          [projectId]: [...(prev[projectId] || []), newAllocatedEmployee]
        }));
      }
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
    const utilizationData = employees.map(employee => {
      const totalAllocation = getEmployeeTotalAllocation(employee.id);
      
      // Get projects this employee is allocated to
      const assignedProjects = Object.entries(projectAllocations)
        .filter(([_, projectEmployees]) => 
          projectEmployees.some(emp => emp.id === employee.id)
        )
        .map(([projectId, projectEmployees]) => {
          const allocation = projectEmployees.find(emp => emp.id === employee.id)?.allocation || 0;
          const project = projectsAndProducts.find(p => p.id.toString() === projectId);
          
          // Count deliverables assigned to this employee
          const assignedDeliverables = project?.monthlyDeliverables?.filter(
            deliverable => deliverable.assignee === employee.name
          ).length || 0;
          
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

  // Sync with actual project deliverables data
  const syncedProjects = useMemo(() => {
    return projectsAndProducts.map(project => {
      // Get employees assigned to deliverables
      const deliverableAssignees = project.monthlyDeliverables
        ?.map(deliverable => deliverable.assignee)
        .filter(Boolean) || [];
      
      return {
        ...project,
        deliverableAssignees: [...new Set(deliverableAssignees)] // Remove duplicates
      };
    });
  }, [projectsAndProducts]);

  // Pagination state for projects
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(syncedProjects.length / itemsPerPage);
  const currentProjects = syncedProjects.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

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
          <div className={`transition-all duration-300 ${isEmployeeListOpen ? 'flex-1' : 'w-full'}`}>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {itemsPerPage} of {syncedProjects.length} projects
              </div>
            </div>
            
            {/* Projects Grid - Fixed 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1 min-h-[400px]">
              {currentProjects.map((project) => {
                const status = getProjectStatus(project.id.toString());
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
                                  onClick={() => finalizeProjectAllocation(project.id.toString())}
                                  className="text-xs h-7"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Finalize
                                </Button>
                              ) : !status.isEditing ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => editProjectAllocation(project.id.toString())}
                                  className="text-xs h-7"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => saveProjectAllocation(project.id.toString())}
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
                                        onValueChange={(value) => updateAllocation(project.id.toString(), employee.id, parseInt(value))}
                                        disabled={isReadOnly}
                                      >
                                        <SelectTrigger className="w-16 h-6 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end" className="min-w-[80px]">
                                          {allocationOptions.map((option) => (
                                            <SelectItem key={option} value={option.toString()} className="text-xs">
                                              {option}%
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      
                                      {!isReadOnly && (
                                        <button
                                          onClick={() => removeEmployeeFromProject(project.id.toString(), employee.id)}
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
                    {employees.map((employee, index) => {
                      const IconComponent = getDepartmentIcon(employee.department);
                      
                      return (
                        <Draggable key={employee.id} draggableId={employee.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 bg-background border rounded-md cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : 'hover:shadow-md'
                              }`}
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
                                </div>
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