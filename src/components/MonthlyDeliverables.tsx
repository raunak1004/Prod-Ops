import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, ChevronLeft, ChevronRight, Filter, Flag, Eye } from "lucide-react";
import { AddTaskForm } from './AddTaskForm';
import { TaskFilters } from './TaskFilters';

interface Task {
  id: string;
  task: string;
  dueDate: string;
  comments: string;
  description: string;
  type: string;
  assignee: string;
  department: string;
  status: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed' | 'done';
  flagged?: boolean;
}

interface MonthlyDeliverablesProps {
  tasks: Task[];
  onAddTask: (task: any) => void;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdate?: (taskId: string, newStatus: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed' | 'done') => void;
  selectedTask: Task | null;
  isTaskDetailOpen: boolean;
  setIsTaskDetailOpen: (open: boolean) => void;
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
  },
  "de-committed": {
    color: "bg-purple-500",
    label: "De-Comm",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
  },
  "done": {
    color: "bg-blue-500",
    label: "Done",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  }
};

export const MonthlyDeliverables: React.FC<MonthlyDeliverablesProps> = ({
  tasks,
  onAddTask,
  onTaskClick,
  onTaskStatusUpdate,
  selectedTask,
  isTaskDetailOpen,
  setIsTaskDetailOpen
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    assignee: '',
    department: 'all'
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate.getMonth() === currentMonth.getMonth() && 
           taskDate.getFullYear() === currentMonth.getFullYear();
  });

  const filteredTasks = currentMonthTasks.filter(task => {
    return (filters.status === 'all' || task.status === filters.status) &&
           (filters.type === 'all' || task.type === filters.type) &&
           (!filters.assignee || task.assignee.toLowerCase().includes(filters.assignee.toLowerCase())) &&
           (filters.department === 'all' || task.department === filters.department);
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleAddTask = (taskData: any) => {
    onAddTask({
      ...taskData,
      status: 'green', // Default status
      flagged: false
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Monthly Deliverables</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Badge variant="outline" className="px-3 py-1">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <AddTaskForm onSubmit={handleAddTask} onCancel={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Tasks Table */}
        <div className="bg-slate-50 rounded-lg p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No Tasks added</p>
              <p className="text-sm">Add a task to get started with this month's deliverables.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Deliverable</TableHead>
                  <TableHead className="w-[15%]">Due Date</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[15%]">Type</TableHead>
                  <TableHead className="w-[15%]">Department</TableHead>
                  <TableHead className="w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const statusConf = statusConfig[task.status];
                  return (
                    <TableRow 
                      key={task.id} 
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => onTaskClick(task)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {task.task}
                          <Eye className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(newStatus: any) => {
                            onTaskStatusUpdate?.(task.id, newStatus);
                          }}
                        >
                          <SelectTrigger className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border-none ${statusConf.bgColor} ${statusConf.textColor} hover:bg-opacity-80 w-auto h-auto`}>
                            <div className={`w-2 h-2 rounded-full ${statusConf.color}`}></div>
                            <SelectValue className="text-xs font-medium" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="amber">Amber</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="de-committed">De-Committed</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {task.type === 'feature-request' ? 'Feature Request' :
                           task.type === 'new-feature' ? 'New Feature' :
                           task.type === 'adhoc' ? 'Adhoc' :
                           task.type === 'bug' ? 'Bug' : task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {task.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-auto ${task.flagged ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle flag - in real app, this would update the task
                          }}
                        >
                          <Flag className="w-4 h-4" fill={task.flagged ? 'currentColor' : 'none'} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
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
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <Badge variant="secondary" className="mt-1">
                    {selectedTask.department}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1">
                    {(() => {
                      const statusConf = statusConfig[selectedTask.status];
                      return (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConf.bgColor} ${statusConf.textColor}`}>
                          <div className={`w-2 h-2 rounded-full ${statusConf.color}`}></div>
                          <span className="text-sm font-medium">{statusConf.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Assignee</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedTask.assignee}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Due Date</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700">Comments</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedTask.comments || "No comments"}</p>
                </div>

                {selectedTask.flagged && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-red-600" fill="currentColor" />
                      <span className="text-sm font-medium text-red-800">Flagged for Attention</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This task has been flagged by the operations team for potential delays or escalation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};