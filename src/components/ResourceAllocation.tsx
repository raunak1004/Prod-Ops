import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Code, Palette, Bug, Target, Users, Settings, Server, Headphones, Trash2 } from 'lucide-react';
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
  const [employees] = useState<Employee[]>(mockEmployees);
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation>({});

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

  const updateAllocation = (projectId: string, employeeId: string, allocation: number) => {
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Employee List Sidebar */}
          <div className="w-80 bg-card rounded-lg border overflow-hidden">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-semibold text-lg">Available Employees</h3>
              <p className="text-sm text-muted-foreground">Drag employees to assign them to projects</p>
            </div>
            
            <Droppable droppableId="employees" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 space-y-3 overflow-y-auto max-h-full"
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
                            className={`p-3 bg-background border rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                              snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(employee.name)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{employee.name}</h4>
                                  <IconComponent className="h-4 w-4 text-muted-foreground shrink-0" />
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{employee.role}</p>
                                <div className="flex flex-wrap gap-1">
                                  {employee.skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs px-2 py-0">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {employee.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0">
                                      +{employee.skills.length - 3}
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

          {/* Projects Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {projectsAndProducts.map((project) => (
                <Droppable key={project.id} droppableId={`project-${project.id}`}>
                  {(provided, snapshot) => (
                    <Card 
                      className={`transition-all ${
                        snapshot.isDraggingOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{project.type}</p>
                          </div>
                          <Badge 
                            variant={project.status === 'green' ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Team Size: {project.teamSize} • Progress: {project.progress}%</p>
                        </div>
                      </CardHeader>
                      
                      <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[120px] ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                      >
                        {projectAllocations[project.id]?.length > 0 ? (
                          <div className="space-y-3">
                            {projectAllocations[project.id].map((employee) => {
                              const IconComponent = getDepartmentIcon(employee.department);
                              
                              return (
                                <div key={employee.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {getInitials(employee.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm truncate">{employee.name}</p>
                                      <IconComponent className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={employee.allocation.toString()}
                                      onValueChange={(value) => updateAllocation(project.id.toString(), employee.id, parseInt(value))}
                                    >
                                      <SelectTrigger className="w-20 h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {allocationOptions.map((option) => (
                                          <SelectItem key={option} value={option.toString()}>
                                            {option}%
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    <button
                                      onClick={() => removeEmployeeFromProject(project.id.toString(), employee.id)}
                                      className="text-muted-foreground hover:text-destructive p-1"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-center">
                            <div className="text-muted-foreground">
                              <p className="text-sm font-medium">Drop employees here</p>
                              <p className="text-xs">Drag employees from the sidebar to assign them</p>
                            </div>
                          </div>
                        )}
                        {provided.placeholder}
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};