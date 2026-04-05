import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useEmployees } from "@/hooks/useEmployees";
import { useAllocations } from "@/hooks/useAllocations";

const taskFormSchema = z.object({
  task:        z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  type:        z.string().min(1, "Type is required"),
  assigneeId:  z.string().min(1, "Assignee is required"),
  assignee:    z.string(),
  department:  z.string().min(1, "Department is required"),
  dueDate:     z.date({ required_error: "Due date is required" }),
  comments:    z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface AddTaskFormProps {
  projectId: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ projectId, onSubmit, onCancel }) => {
  const { employees } = useEmployees();
  const { getProjectAllocations } = useAllocations();
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  // Only show employees allocated to this project
  const allocatedEmployees = useMemo(() => {
    const allocs = getProjectAllocations(projectId);
    return allocs
      .map(a => employees.find(e => e.id === a.employee_id))
      .filter((e): e is NonNullable<typeof e> => !!e);
  }, [projectId, employees, getProjectAllocations]);

  // Unique departments from allocated employees
  const departments = useMemo(() => {
    const depts = allocatedEmployees.map(e => e.department).filter(Boolean) as string[];
    return [...new Set(depts)].sort();
  }, [allocatedEmployees]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: '', description: '', type: '',
      assigneeId: '', assignee: '', department: '',
      dueDate: undefined, comments: '',
    },
  });

  // Auto-fill department when assignee is selected
  const selectedAssigneeId = form.watch('assigneeId');
  useEffect(() => {
    if (!selectedAssigneeId) return;
    const emp = allocatedEmployees.find(e => e.id === selectedAssigneeId);
    if (emp?.department) form.setValue('department', emp.department, { shouldValidate: true });
    if (emp?.full_name)  form.setValue('assignee', emp.full_name);
  }, [selectedAssigneeId, allocatedEmployees, form]);

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    form.reset();
  };

  const selectedAssigneeName = allocatedEmployees.find(e => e.id === selectedAssigneeId)?.full_name;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

        {/* Task name */}
        <FormField control={form.control} name="task" render={({ field }) => (
          <FormItem>
            <FormLabel>Task *</FormLabel>
            <FormControl>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter task name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Description */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-slate-400 font-normal">(optional)</span></FormLabel>
            <FormControl><Textarea placeholder="Brief description of the task" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Type + Assignee */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new-feature">New Feature</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="adhoc">Adhoc</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="assigneeId" render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee *</FormLabel>
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                    >
                      {selectedAssigneeName ?? (
                        allocatedEmployees.length === 0
                          ? "No one allocated yet"
                          : "Search employee…"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name…" />
                    <CommandList>
                      {allocatedEmployees.length === 0 ? (
                        <CommandEmpty>
                          No employees allocated to this project yet. Go to Resource → Allocation to add some.
                        </CommandEmpty>
                      ) : (
                        <>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {allocatedEmployees.map(emp => (
                              <CommandItem
                                key={emp.id}
                                value={emp.full_name}
                                onSelect={() => {
                                  field.onChange(emp.id);
                                  setAssigneeOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", field.value === emp.id ? "opacity-100" : "opacity-0")} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{emp.full_name}</p>
                                  {(emp.position || emp.department) && (
                                    <p className="text-xs text-slate-400 truncate">
                                      {[emp.position, emp.department].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Department (auto-filled) + Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel>Department *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-filled from assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Comments */}
        <FormField control={form.control} name="comments" render={({ field }) => (
          <FormItem>
            <FormLabel>Comments <span className="text-slate-400 font-normal">(optional)</span></FormLabel>
            <FormControl><Textarea placeholder="Any additional notes" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={allocatedEmployees.length === 0}>Add Task</Button>
        </div>
      </form>
    </Form>
  );
};
