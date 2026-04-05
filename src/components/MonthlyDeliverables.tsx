import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, ChevronLeft, ChevronRight, Filter, Flag } from "lucide-react";
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
  projectId: string;
  tasks: Task[];
  onAddTask: (task: any) => void;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdate?: (taskId: string, newStatus: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed' | 'done') => void;
  onTaskFlag?: (taskId: string, flagged: boolean) => void;
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
  projectId,
  tasks,
  onAddTask,
  onTaskClick,
  onTaskStatusUpdate,
  onTaskFlag,
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
                <AddTaskForm projectId={projectId} onSubmit={handleAddTask} onCancel={() => setIsDialogOpen(false)} />
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
                <TableRow className="border-slate-200">
                  <TableHead className="w-[30%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Deliverable</TableHead>
                  <TableHead className="w-[18%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</TableHead>
                  <TableHead className="w-[12%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="w-[14%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</TableHead>
                  <TableHead className="w-[14%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</TableHead>
                  <TableHead className="w-[8%] text-xs font-semibold text-slate-500 uppercase tracking-wide">Flag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const statusConf = statusConfig[task.status];
                  const typeLabel =
                    task.type === 'feature-request' ? 'Feature Request' :
                    task.type === 'new-feature'     ? 'New Feature' :
                    task.type === 'adhoc'           ? 'Adhoc' :
                    task.type === 'bug'             ? 'Bug' : task.type;

                  const formattedDate = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';

                  const initials = task.assignee
                    ? task.assignee.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : null;

                  return (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-slate-50 border-slate-100"
                      onClick={() => onTaskClick(task)}
                    >
                      {/* Deliverable */}
                      <TableCell className="font-medium text-slate-900 py-3">
                        {task.task}
                      </TableCell>

                      {/* Assignee */}
                      <TableCell className="py-3">
                        {task.assignee && task.assignee !== 'Unassigned' ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-slate-800 truncate">{task.assignee}</p>
                              {task.department && task.department !== 'Unknown' && (
                                <p className="text-xs text-slate-400 truncate">{task.department}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="text-sm text-slate-600 py-3 whitespace-nowrap">
                        {formattedDate}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(newStatus: any) => onTaskStatusUpdate?.(task.id, newStatus)}
                        >
                          <SelectTrigger className={`h-7 w-auto gap-1.5 px-2.5 text-xs font-medium border-0 rounded-full ${statusConf.bgColor} ${statusConf.textColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConf.color}`} />
                            <SelectValue />
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

                      {/* Type */}
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {typeLabel}
                        </Badge>
                      </TableCell>

                      {/* Flag */}
                      <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onTaskFlag?.(task.id, !task.flagged)}
                          className={`p-1 rounded hover:bg-slate-100 transition-colors ${task.flagged ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                        >
                          <Flag className="w-3.5 h-3.5" fill={task.flagged ? 'currentColor' : 'none'} />
                        </button>
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
          <SheetContent className="w-[420px] sm:w-[460px] p-0 flex flex-col">
            {selectedTask && (() => {
              const statusConf = statusConfig[selectedTask.status];
              const initials = selectedTask.assignee
                ? selectedTask.assignee.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : null;
              const typeLabel =
                selectedTask.type === 'feature-request' ? 'Feature Request' :
                selectedTask.type === 'new-feature'     ? 'New Feature' :
                selectedTask.type === 'adhoc'           ? 'Adhoc' :
                selectedTask.type === 'bug'             ? 'Bug' : selectedTask.type;
              const formattedDate = selectedTask.dueDate
                ? new Date(selectedTask.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—';
              return (
                <>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <SheetTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {selectedTask.task}
                        </SheetTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bgColor} ${statusConf.textColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConf.color}`} />
                            {statusConf.label}
                          </div>
                          <Badge variant="outline" className="text-xs font-normal">{typeLabel}</Badge>
                          {selectedTask.flagged && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                              <Flag className="w-3 h-3" fill="currentColor" /> Flagged
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onTaskFlag?.(selectedTask.id, !selectedTask.flagged)}
                        className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 ${selectedTask.flagged ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                        title={selectedTask.flagged ? 'Remove flag' : 'Flag this task'}
                      >
                        <Flag className="w-4 h-4" fill={selectedTask.flagged ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Assignee */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Assignee</p>
                      {selectedTask.assignee && selectedTask.assignee !== 'Unassigned' ? (
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{selectedTask.assignee}</p>
                            {selectedTask.department && selectedTask.department !== 'Unknown' && (
                              <p className="text-xs text-slate-400">{selectedTask.department}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Unassigned</p>
                      )}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Due Date + Status side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Due Date</p>
                        <p className="text-sm text-slate-900">{formattedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Status</p>
                        <Select
                          value={selectedTask.status}
                          onValueChange={(v: any) => onTaskStatusUpdate?.(selectedTask.id, v)}
                        >
                          <SelectTrigger className={`h-7 w-auto gap-1.5 px-2.5 text-xs font-medium border-0 rounded-full ${statusConf.bgColor} ${statusConf.textColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConf.color}`} />
                            <SelectValue />
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
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Description */}
                    {selectedTask.description && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selectedTask.description}</p>
                      </div>
                    )}

                    {/* Comments */}
                    {selectedTask.comments && selectedTask.comments !== selectedTask.description && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Comments</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selectedTask.comments}</p>
                      </div>
                    )}

                    {/* Flag banner */}
                    {selectedTask.flagged && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <Flag className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Flagged for attention</p>
                          <p className="text-xs text-red-600 mt-0.5">This task has been flagged for potential delays or escalation.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};