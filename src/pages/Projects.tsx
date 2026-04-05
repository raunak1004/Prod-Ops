import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useToast } from "@/hooks/use-toast";
import { importProjectsFromKeka } from '@/services/kekaApi';
import { supabase } from '@/integrations/supabase/client';
import { STATUS_MAP } from '@/lib/constants';
import { ProjectFilters, ProjectFilterState, DEFAULT_FILTERS } from '@/components/ProjectFilters';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  full_name: string;
  department?: string;
}

interface ProjectFormState {
  name: string;
  description: string;
  status: string;
  pm_status: string;
  ops_status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget: string;
  manager_id: string;
}

const INITIAL_FORM: ProjectFormState = {
  name: '', description: '', status: 'not-started', pm_status: 'not-started',
  ops_status: 'not-started', priority: '', start_date: '', end_date: '',
  budget: '', manager_id: '',
};

// ─── ProjectFormDialog ─────────────────────────────────────────────────────────

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  form: ProjectFormState;
  employees: Employee[];
  isSaving: boolean;
  isValid: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: () => void;
}

function ProjectFormDialog({
  open, onOpenChange, title, submitLabel, form, employees,
  isSaving, isValid, onFormChange, onSelectChange, onSubmit,
}: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Name*</Label><Input name="name" value={form.name} onChange={onFormChange} /></div>
          <div><Label>Description</Label><Input name="description" value={form.description} onChange={onFormChange} /></div>
          <div><Label>Priority</Label><Input name="priority" value={form.priority} onChange={onFormChange} /></div>
          <div><Label>Start Date*</Label><Input name="start_date" type="date" value={form.start_date} onChange={onFormChange} /></div>
          <div><Label>End Date</Label><Input name="end_date" type="date" value={form.end_date} onChange={onFormChange} /></div>
          <div><Label>Budget</Label><Input name="budget" type="number" value={form.budget} onChange={onFormChange} /></div>
          <div>
            <Label>Manager*</Label>
            <Select value={form.manager_id} onValueChange={v => onSelectChange('manager_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}{emp.department ? ` — ${emp.department}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onSubmit} disabled={isSaving || !isValid}>
            {isSaving ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Projects Page ─────────────────────────────────────────────────────────────

const Projects = () => {
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, employeesRes, deliverablesRes, issuesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').eq('status', 'active').order('full_name'),
        supabase.from('deliverables').select('*'),
        supabase.from('issues').select('*'),
      ]);
      if (projectsRes.error) throw projectsRes.error;
      if (employeesRes.error) throw employeesRes.error;
      if (deliverablesRes.error) throw deliverablesRes.error;
      if (issuesRes.error) throw issuesRes.error;
      setProjects(projectsRes.data ?? []);
      setEmployees(employeesRes.data ?? []);
      setDeliverables(deliverablesRes.data ?? []);
      setIssues(issuesRes.data ?? []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const importFromKeka = useCallback(async () => {
    setIsImporting(true);
    try {
      const result = await importProjectsFromKeka();
      const { inserted, updated, message } = result;

      if (inserted === 0 && updated === 0) {
        toast({ title: "No Projects Found", description: message ?? "No projects returned from Keka.", variant: "destructive" });
        return;
      }

      const parts = [];
      if (inserted > 0) parts.push(`${inserted} added`);
      if (updated > 0) parts.push(`${updated} updated`);
      toast({ title: "Import Successful", description: parts.join(', ') + '.' });
      await fetchAllData();
    } catch (err: any) {
      toast({ title: "Import Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  }, [toast, fetchAllData]);

  const updateProjectStatus = useCallback(async (projectId: string, newStatus: string, statusType: string) => {
    const { error } = await supabase.from('projects').update({ [statusType]: newStatus }).eq('id', projectId);
    if (error) throw error;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [statusType]: newStatus } : p));
  }, []);

  const handleStatusUpdate = useCallback((projectId: string, statusType: string, newStatus: string) => {
    const dbKey = statusType === 'pmStatus' ? 'pm_status' : statusType === 'opsStatus' ? 'ops_status' : 'status';
    return updateProjectStatus(projectId, newStatus, dbKey);
  }, [updateProjectStatus]);

  const transformedProjects = useMemo(() => {
    const now = new Date();
    return projects.map(project => {
      const monthDeliverables = deliverables.filter(d =>
        d.project_id === project.id && d.due_date &&
        new Date(d.due_date).getMonth() === now.getMonth() &&
        new Date(d.due_date).getFullYear() === now.getFullYear()
      );
      const completed = monthDeliverables.filter(d => d.status === 'completed' || d.status === 'done').length;
      return {
        id: project.id,
        name: project.name,
        type: 'Projects' as const,
        status: STATUS_MAP[project.status?.toLowerCase()] ?? 'not-started',
        progress: monthDeliverables.length > 0 ? Math.round((completed / monthDeliverables.length) * 100) : 0,
        dueDate: project.end_date ?? '',
        department: 'Unknown',
        lead: [] as any[],
        deliverables: monthDeliverables.length,
        completedDeliverables: completed,
        blockers: issues.filter(i => i.project_id === project.id && i.status === 'open' && i.severity === 'high').length,
        teamSize: new Set(monthDeliverables.map((d: any) => d.assignee_name).filter(Boolean)).size,
        hoursAllocated: 0,
        hoursUsed: 0,
        lastCallDate: project.updated_at,
        pmStatus: STATUS_MAP[project.pm_status?.toLowerCase()] ?? 'not-started',
        opsStatus: STATUS_MAP[project.ops_status?.toLowerCase()] ?? 'not-started',
        healthTrend: 'constant' as const,
        monthlyDeliverables: [],
        pastWeeksStatus: [],
      };
    });
  }, [projects, deliverables, issues]);

  const filteredProjects = useMemo(() =>
    transformedProjects.filter(p => {
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.pmStatus !== 'all' && p.pmStatus !== filters.pmStatus) return false;
      if (filters.opsStatus !== 'all' && p.opsStatus !== filters.opsStatus) return false;
      return true;
    }),
    [transformedProjects, filters]
  );

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!form.name) { toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" }); return false; }
    if (!form.manager_id) { toast({ title: "Validation Error", description: "Manager is required.", variant: "destructive" }); return false; }
    if (!form.start_date) { toast({ title: "Validation Error", description: "Start date is required.", variant: "destructive" }); return false; }
    if (form.budget && isNaN(Number(form.budget))) { toast({ title: "Validation Error", description: "Budget must be a number.", variant: "destructive" }); return false; }
    if (form.end_date && new Date(form.start_date) > new Date(form.end_date)) { toast({ title: "Validation Error", description: "End date must be after start date.", variant: "destructive" }); return false; }
    return true;
  }, [form, toast]);

  const isFormValid = Boolean(
    form.name && form.manager_id && form.start_date &&
    (!form.budget || !isNaN(Number(form.budget))) &&
    (!form.end_date || new Date(form.start_date) <= new Date(form.end_date))
  );

  const handleAdd = useCallback(async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('projects').insert([{
        name: form.name, description: form.description,
        status: form.status || 'not-started',
        pm_status: form.pm_status || 'not-started',
        ops_status: form.ops_status || 'not-started',
        priority: form.priority, start_date: form.start_date,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        manager_id: form.manager_id, progress: 0,
      }]).select().single();
      if (error) throw error;
      setProjects(prev => [data, ...prev]);
      setAddOpen(false);
      setForm(INITIAL_FORM);
      toast({ title: "Project Added" });
    } catch {
      toast({ title: "Error", description: "Failed to add project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [form, validateForm, toast]);

  const handleEdit = useCallback(async () => {
    if (!validateForm() || !editingProject) return;
    setIsSaving(true);
    try {
      const updates = {
        name: form.name, description: form.description,
        status: form.status || 'not-started',
        pm_status: form.pm_status || 'not-started',
        ops_status: form.ops_status || 'not-started',
        priority: form.priority, start_date: form.start_date,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        manager_id: form.manager_id,
      };
      const { error } = await supabase.from('projects').update(updates).eq('id', editingProject.id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...updates } : p));
      setEditOpen(false);
      setEditingProject(null);
      setForm(INITIAL_FORM);
      toast({ title: "Project Updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [form, editingProject, validateForm, toast]);

  const openEdit = useCallback((project: any) => {
    setEditingProject(project);
    setForm({
      name: project.name ?? '', description: project.description ?? '',
      status: project.status ?? 'not-started', pm_status: project.pm_status ?? 'not-started',
      ops_status: project.ops_status ?? 'not-started', priority: project.priority ?? '',
      start_date: project.start_date ?? '', end_date: project.end_date ?? '',
      budget: project.budget?.toString() ?? '', manager_id: project.manager_id ?? '',
    });
    setEditOpen(true);
  }, []);

  const sharedFormProps = { form, employees, isSaving, isValid: isFormValid, onFormChange: handleFormChange, onSelectChange: handleSelectChange };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && <ErrorBanner message={error} />}

        {/* ── Page header ── */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects &amp; Products</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectFilters filters={filters} onChange={setFilters} />
            <Button variant="outline" size="sm" onClick={importFromKeka} disabled={isImporting}>
              <Download className="h-4 w-4 mr-1.5" />
              {isImporting ? 'Importing…' : 'Import from Keka'}
            </Button>
            <Button size="sm" onClick={() => { setForm(INITIAL_FORM); setAddOpen(true); }}>
              + Add Project
            </Button>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No projects match the current filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onStatusUpdate={handleStatusUpdate}
                onEdit={() => openEdit(projects.find(p => p.id === project.id))}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Project / Product"
        submitLabel="Add Project"
        onSubmit={handleAdd}
        {...sharedFormProps}
      />

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Project / Product"
        submitLabel="Save Changes"
        onSubmit={handleEdit}
        {...sharedFormProps}
      />
    </div>
  );
};

export default Projects;
