import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, User, Clock, Plus, CalendarIcon, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as z from "zod";

// Mock data - in a real app, this would come from an API
const mockProjects = [
  {
    id: 1,
    name: "Mobile App Redesign",
    status: "green" as const,
    progress: 85,
    dueDate: "2024-07-15",
    department: "Product",
    lead: "Sarah Johnson",
    deliverables: 8,
    completedDeliverables: 7,
    blockers: 0,
    teamSize: 6,
    hoursAllocated: 480,
    hoursUsed: 380,
    lastCallDate: "2024-07-08",
    pmStatus: "green" as const,
    opsStatus: "green" as const,
    healthTrend: "improving" as const,
    monthlyDeliverables: [
      { id: 1, task: "UI/UX Design Completion", dueDate: "2024-07-15", comments: "Final review in progress", description: "Complete the final UI/UX design review", type: "new-feature", assignee: "John Doe" },
      { id: 2, task: "Backend API Integration", dueDate: "2024-07-20", comments: "On track", description: "Integrate backend APIs with frontend", type: "feature-request", assignee: "Jane Smith" },
      { id: 3, task: "Testing Phase", dueDate: "2024-07-25", comments: "Waiting for development completion", description: "Comprehensive testing of all features", type: "adhoc", assignee: "Mike Johnson" }
    ],
    pastWeeksStatus: [
      { week: "Week 1", status: "green" },
      { week: "Week 2", status: "green" },
      { week: "Week 3", status: "amber" },
      { week: "Week 4", status: "green" }
    ]
  },
  {
    id: 2,
    name: "API Integration Platform",
    status: "amber" as const,
    progress: 70,
    dueDate: "2024-07-10",
    department: "Engineering",
    lead: "Michael Chen",
    deliverables: 12,
    completedDeliverables: 8,
    blockers: 2,
    teamSize: 4,
    hoursAllocated: 600,
    hoursUsed: 520,
    lastCallDate: "2024-07-05",
    pmStatus: "amber" as const,
    opsStatus: "red" as const,
    healthTrend: "declining" as const,
    monthlyDeliverables: [
      { id: 1, task: "Database Schema Migration", dueDate: "2024-07-12", comments: "Delayed due to complexity", description: "Migrate database schema to new version", type: "bug", assignee: "Alex Chen" },
      { id: 2, task: "Third-party API Testing", dueDate: "2024-07-18", comments: "Dependencies blocking progress", description: "Test integration with third-party APIs", type: "feature-request", assignee: "Sarah Wilson" },
      { id: 3, task: "Security Audit", dueDate: "2024-07-22", comments: "Scheduled for next week", description: "Comprehensive security audit", type: "adhoc", assignee: "David Kim" }
    ],
    pastWeeksStatus: [
      { week: "Week 1", status: "amber" },
      { week: "Week 2", status: "red" },
      { week: "Week 3", status: "red" },
      { week: "Week 4", status: "amber" }
    ]
  },
  {
    id: 3,
    name: "Customer Analytics Dashboard",
    status: "red" as const,
    progress: 45,
    dueDate: "2024-06-30",
    department: "Data",
    lead: "Emily Rodriguez",
    deliverables: 10,
    completedDeliverables: 4,
    blockers: 4,
    teamSize: 5,
    hoursAllocated: 400,
    hoursUsed: 350,
    lastCallDate: "2024-07-07",
    pmStatus: "red" as const,
    opsStatus: "red" as const,
    healthTrend: "constant" as const,
    monthlyDeliverables: [
      { id: 1, task: "Data Pipeline Setup", dueDate: "2024-07-14", comments: "Major technical challenges", description: "Set up data pipeline infrastructure", type: "new-feature", assignee: "Emily Rodriguez" },
      { id: 2, task: "Report Generation Module", dueDate: "2024-07-21", comments: "Waiting for data pipeline", description: "Develop report generation functionality", type: "feature-request", assignee: "Tom Brown" },
      { id: 3, task: "User Interface Development", dueDate: "2024-07-28", comments: "Resource constraints", description: "Build user interface components", type: "new-feature", assignee: "Lisa Chen" }
    ],
    pastWeeksStatus: [
      { week: "Week 1", status: "red" },
      { week: "Week 2", status: "red" },
      { week: "Week 3", status: "red" },
      { week: "Week 4", status: "red" }
    ]
  },
  {
    id: 4,
    name: "Security Compliance Update",
    status: "green" as const,
    progress: 90,
    dueDate: "2024-07-20",
    department: "Security",
    lead: "David Park",
    deliverables: 6,
    completedDeliverables: 5,
    blockers: 0,
    teamSize: 3,
    hoursAllocated: 320,
    hoursUsed: 280,
    lastCallDate: "2024-07-06",
    pmStatus: "green" as const,
    opsStatus: "green" as const,
    healthTrend: "improving" as const,
    monthlyDeliverables: [
      { id: 1, task: "Security Policy Updates", dueDate: "2024-07-16", comments: "Nearly complete", description: "Update security policies and procedures", type: "adhoc", assignee: "David Park" },
      { id: 2, task: "Vulnerability Assessment", dueDate: "2024-07-19", comments: "Scheduled for this week", description: "Conduct vulnerability assessment", type: "adhoc", assignee: "Security Team" },
      { id: 3, task: "Compliance Documentation", dueDate: "2024-07-24", comments: "Ready for review", description: "Prepare compliance documentation", type: "feature-request", assignee: "Compliance Team" }
    ],
    pastWeeksStatus: [
      { week: "Week 1", status: "green" },
      { week: "Week 2", status: "green" },
      { week: "Week 3", status: "green" },
      { week: "Week 4", status: "green" }
    ]
  },
  {
    id: 5,
    name: "Marketing Automation Tool",
    status: "amber" as const,
    progress: 65,
    dueDate: "2024-07-12",
    department: "Marketing",
    lead: "Jessica Wu",
    deliverables: 9,
    completedDeliverables: 6,
    blockers: 1,
    teamSize: 4,
    hoursAllocated: 360,
    hoursUsed: 280,
    lastCallDate: "2024-07-04",
    pmStatus: "green" as const,
    opsStatus: "amber" as const,
    healthTrend: "constant" as const,
    monthlyDeliverables: [
      { id: 1, task: "Email Campaign Builder", dueDate: "2024-07-17", comments: "Feature complete, testing needed", description: "Build email campaign creation tool", type: "new-feature", assignee: "Jessica Wu" },
      { id: 2, task: "Analytics Dashboard", dueDate: "2024-07-23", comments: "UI development in progress", description: "Create analytics dashboard", type: "feature-request", assignee: "Marketing Team" },
      { id: 3, task: "Integration Testing", dueDate: "2024-07-26", comments: "Planned after feature completion", description: "Test system integrations", type: "adhoc", assignee: "QA Team" }
    ],
    pastWeeksStatus: [
      { week: "Week 1", status: "green" },
      { week: "Week 2", status: "amber" },
      { week: "Week 3", status: "amber" },
      { week: "Week 4", status: "amber" }
    ]
  }
];

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "On Track",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  amber: {
    color: "bg-amber-500", 
    label: "At Risk",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  red: {
    color: "bg-red-500",
    label: "Delayed", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
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

// Form validation schema
const taskFormSchema = z.object({
  task: z.string().min(1, "Task is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.date({
    required_error: "Due date is required"
  }),
  comments: z.string().optional()
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [projectData, setProjectData] = useState(() => 
    mockProjects.find(p => p.id === parseInt(id || '0'))
  );
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: "",
      description: "",
      type: "",
      assignee: "",
      dueDate: undefined,
      comments: ""
    }
  });
  
  const project = projectData;

  const onSubmit = (data: TaskFormData) => {
    if (!project) return;
    
    const newTask = {
      id: project.monthlyDeliverables.length + 1,
      task: data.task,
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      comments: data.comments || "",
      description: data.description,
      type: data.type,
      assignee: data.assignee
    };
    
    const updatedProject = {
      ...project,
      monthlyDeliverables: [...project.monthlyDeliverables, newTask]
    };
    
    setProjectData(updatedProject);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const trendData = trendConfig[project.healthTrend];
  const TrendIcon = trendData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Pocket Notebook Style Container */}
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
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    {project.lead}
                  </div>
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
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pmConfig.bgColor} ${pmConfig.textColor}`}>
                  <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
                  <span className="text-sm font-medium">{pmConfig.label}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Ops Status</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${opsConfig.bgColor} ${opsConfig.textColor}`}>
                  <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
                  <span className="text-sm font-medium">{opsConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Past Weeks Status */}
            <div className="mt-6 space-y-3">
              <div className="text-sm font-medium text-slate-700">Past 4 Weeks Status</div>
              <div className="flex items-center gap-3">
                {project.pastWeeksStatus.map((week, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-3 h-3 rounded-full border-2 border-dashed ${
                        week.status === 'green' ? 'bg-green-500 border-green-300' :
                        week.status === 'amber' ? 'bg-amber-500 border-amber-300' :
                        'bg-red-500 border-red-300'
                      }`}
                    ></div>
                    <span className="text-xs text-slate-500">{week.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deliverables Table */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Monthly Deliverables</h2>
              <Badge variant="outline" className="ml-auto">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Badge>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="ml-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="task"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brief Description of task</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter task description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select task type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="feature-request">Feature Request</SelectItem>
                                <SelectItem value="new-feature">New Feature</SelectItem>
                                <SelectItem value="adhoc">Adhoc</SelectItem>
                                <SelectItem value="bug">Bug</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="assignee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assignee</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter assignee name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comments</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter comments" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Task</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Deliverable</TableHead>
                    <TableHead className="w-[20%]">Due Date</TableHead>
                    <TableHead className="w-[40%]">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.monthlyDeliverables.map((deliverable) => (
                    <TableRow 
                      key={deliverable.id} 
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => handleTaskClick(deliverable)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {deliverable.task}
                          <Eye className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(deliverable.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{deliverable.comments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Year Record Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Year Record</span>
              </div>
              <p className="text-sm text-amber-700">
                This project maintains a complete record for the entire year, updated by the operations team and project managers.
              </p>
            </div>
          </div>
        </div>

        {/* Task Detail Side Sheet */}
        <Sheet open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Task Details</SheetTitle>
            </SheetHeader>
            {selectedTask && (
              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700">Task</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedTask.task}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedTask.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <Badge variant="outline" className="mt-1">
                    {selectedTask.type === 'feature-request' ? 'Feature Request' :
                     selectedTask.type === 'new-feature' ? 'New Feature' :
                     selectedTask.type === 'adhoc' ? 'Adhoc' :
                     selectedTask.type === 'bug' ? 'Bug' : selectedTask.type}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Assignee</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-900">{selectedTask.assignee}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Due Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-900">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Comments</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedTask.comments || "No comments"}</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ProjectDetail;