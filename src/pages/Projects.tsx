import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchProjects as fetchKekaProjects } from '@/services/kekaApi';
import { supabase } from '@/lib/supabase';

const INITIAL_FORM_STATE = {
  name: '', description: '', status: 'not-started', pm_status: 'not-started',
  ops_status: 'not-started', priority: '', start_date: '', end_date: '', budget: '', manager_id: ''
};

const STATUS_MAP = {
  'active': 'green', 'completed': 'green', 'green': 'green',
  'planning': 'amber', 'pending': 'amber', 'amber': 'amber',
  'on-hold': 'red', 'cancelled': 'red', 'red': 'red',
  'not-started': 'not-started'
};

const KEKA_TO_DB_STATUS = {
  'active': 'active', 'completed': 'completed', 'on-hold': 'on-hold',
  'cancelled': 'cancelled', 'not-started': 'not-started'
};

const Projects = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, employeesRes, deliverablesRes, issuesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').eq('status', 'active').order('full_name'),
        supabase.from('deliverables').select('*'),
        supabase.from('issues').select('*')
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (employeesRes.error) throw employeesRes.error;
      if (deliverablesRes.error) throw deliverablesRes.error;
      if (issuesRes.error) throw issuesRes.error;

      setProjects(projectsRes.data || []);
      setEmployees(employeesRes.data || []);
      setDeliverables(deliverablesRes.data || []);
      setIssues(issuesRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Import from Keka
  const importFromKeka = useCallback(async () => {
    setIsImporting(true);
    try {
      const kekaProjects = await fetchKekaProjects();
      
      if (!kekaProjects?.length) {
        toast({ title: "No Projects Found", description: "No projects from Keka API.", variant: "destructive" });
        return;
      }

      const upsertPromises = kekaProjects.map(async (kp) => {
        const projectData = {
          name: kp.name,
          description: kp.description || '',
          status: KEKA_TO_DB_STATUS[kp.status?.toLowerCase()] || 'not-started',
          pm_status: 'not-started',
          ops_status: 'not-started',
          priority: '',
          start_date: kp.startDate || null,
          end_date: kp.endDate || null,
          budget: kp.budget || null,
          progress: kp.progress || 0,
          manager_id: kp.manager?.length > 0 ? kp.manager : []
        };

        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('name', projectData.name)
          .maybeSingle();

        if (existing) {
          return supabase.from('projects').update(projectData).eq('id', existing.id).select().single();
        }
        return supabase.from('projects').insert([projectData]).select().single();
      });

      const results = await Promise.allSettled(upsertPromises);
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (succeeded > 0) {
        toast({ title: "Import Successful", description: `${succeeded} project(s) imported.` });
        await fetchAllData();
      }
      if (failed > 0) {
        toast({ title: "Partial Import", description: `${failed} project(s) failed.`, variant: "destructive" });
      }
    } catch (err) {
      console.error('Import error:', err);
      toast({ title: "Import Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  }, [toast, fetchAllData]);

  // CRUD operations
  const updateProjectStatus = useCallback(async (projectId, newStatus, statusType) => {
    try {
      const { error } = await supabase.from('projects').update({ [statusType]: newStatus }).eq('id', projectId);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [statusType]: newStatus } : p));
    } catch (err) {
      console.error('Status update error:', err);
      throw err;
    }
  }, []);

  const addProject = useCallback(async (projectData) => {
    const { data, error } = await supabase.from('projects').insert([projectData]).select().single();
    if (error) throw error;
    setProjects(prev => [data, ...prev]);
    return data;
  }, []);

  const editProject = useCallback(async (projectId, updates) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId).select().single();
    if (error) throw error;
    setProjects(prev => prev.map(p => p.id === projectId ? data : p));
    return data;
  }, []);

  // Transform projects
  const transformedProjects = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return projects.map(project => {
      const projectDeliverables = deliverables.filter(d => 
        d.project_id === project.id && d.due_date &&
        new Date(d.due_date).getMonth() === currentMonth &&
        new Date(d.due_date).getFullYear() === currentYear
      );

      const completedDeliverables = projectDeliverables.filter(d => 
        d.status === 'completed' || d.status === 'done'
      ).length;

      const managerList = Array.isArray(project.manager_id) ? project.manager_id : [];

      return {
        id: project.id,
        originalId: project.id,
        name: project.name,
        type: "Projects" as const,
        status: STATUS_MAP[project.status?.toLowerCase()] || 'not-started',
        progress: projectDeliverables.length > 0 ? Math.round((completedDeliverables / projectDeliverables.length) * 100) : 0,
        dueDate: project.end_date || '',
        department: managerList[0]?.department || 'Unknown',
        lead: managerList,
        deliverables: projectDeliverables.length,
        completedDeliverables,
        blockers: issues.filter(i => i.project_id === project.id && i.status === 'open' && i.severity === 'high').length,
        teamSize: new Set(projectDeliverables.map(d => d.assignee_name)).size,
        hoursAllocated: 0,
        hoursUsed: 0,
        lastCallDate: project.updated_at,
        pmStatus: STATUS_MAP[project.pm_status?.toLowerCase()] || 'not-started',
        opsStatus: STATUS_MAP[project.ops_status?.toLowerCase()] || 'not-started',
        healthTrend: "constant" as const,
        monthlyDeliverables: [],
        pastWeeksStatus: []
      };
    });
  }, [projects, deliverables, issues]);

  // Filter projects
  const filteredProjects = useMemo(() => transformedProjects.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead.some(m => m.name?.toLowerCase().includes(filters.assignee.toLowerCase()))) return false;
    return true;
  }), [transformedProjects, filters]);

  // Event handlers
  const handleStatusUpdate = useCallback(async (projectId, statusType, newStatus) => {
    const dbStatusType = statusType === 'pmStatus' ? 'pm_status' : statusType === 'opsStatus' ? 'ops_status' : 'status';
    await updateProjectStatus(projectId, newStatus, dbStatusType);
  }, [updateProjectStatus]);

  const handleOpenAdd = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setIsAddDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((project) => {
    setEditingProject(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'not-started',
      pm_status: project.pm_status || 'not-started',
      ops_status: project.ops_status || 'not-started',
      priority: project.priority || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget?.toString() || '',
      manager_id: project.manager_id || ''
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleFormChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!form.name) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return false;
    }
    if (!form.manager_id) {
      toast({ title: "Validation Error", description: "Manager is required.", variant: "destructive" });
      return false;
    }
    if (!form.start_date) {
      toast({ title: "Validation Error", description: "Start date is required.", variant: "destructive" });
      return false;
    }
    if (form.budget && isNaN(Number(form.budget))) {
      toast({ title: "Validation Error", description: "Budget must be valid.", variant: "destructive" });
      return false;
    }
    if (form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      toast({ title: "Validation Error", description: "Invalid date range.", variant: "destructive" });
      return false;
    }
    return true;
  }, [form, toast]);

  const handleAdd = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await addProject({
        name: form.name,
        description: form.description,
        status: form.status || 'not-started',
        pm_status: form.pm_status || 'not-started',
        ops_status: form.ops_status || 'not-started',
        priority: form.priority,
        start_date: form.start_date,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        manager_id: form.manager_id,
        progress: 0,
      });
      setIsAddDialogOpen(false);
      setForm(INITIAL_FORM_STATE);
      toast({ title: "Project Added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [form, validateForm, addProject, toast]);

  const handleEdit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await editProject(editingProject.id, {
        name: form.name,
        description: form.description,
        status: form.status || 'not-started',
        pm_status: form.pm_status || 'not-started',
        ops_status: form.ops_status || 'not-started',
        priority: form.priority,
        start_date: form.start_date,
        end_date: form.end_date,
        budget: form.budget ? parseFloat(form.budget) : null,
        manager_id: form.manager_id
      });
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setForm(INITIAL_FORM_STATE);
      toast({ title: "Project Updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [form, editingProject, validateForm, editProject, toast]);

  const isFormValid = form.name && form.manager_id && form.start_date && 
    (!form.budget || !isNaN(Number(form.budget))) && 
    (!form.start_date || !form.end_date || new Date(form.start_date) <= new Date(form.end_date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-medium">Some data failed to load</div>
                  <div>{error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects and Products</h1>
            <p className="text-slate-600 mt-1">Track and manage all your active projects and products</p>
          </div>
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={importFromKeka} disabled={isImporting}>
              <Download className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Import from Keka"}
            </Button>
            <Button onClick={handleOpenAdd}>Add Project/Product</Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-brand-primary mb-4" />
                <span>Loading Projects</span>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard project={project} onStatusUpdate={handleStatusUpdate} />
                <Button size="sm" className="absolute top-2 right-2 z-10" onClick={() => handleOpenEdit(project)}>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Project/Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name*</Label><Input name="name" value={form.name} onChange={handleFormChange} /></div>
            <div><Label>Description</Label><Input name="description" value={form.description} onChange={handleFormChange} /></div>
            <div><Label>Priority</Label><Input name="priority" value={form.priority} onChange={handleFormChange} /></div>
            <div><Label>Start Date*</Label><Input name="start_date" type="date" value={form.start_date} onChange={handleFormChange} /></div>
            <div><Label>End Date</Label><Input name="end_date" type="date" value={form.end_date} onChange={handleFormChange} /></div>
            <div><Label>Budget</Label><Input name="budget" type="number" value={form.budget} onChange={handleFormChange} /></div>
            <div>
              <Label>Manager*</Label>
              <Select value={form.manager_id} onValueChange={(value) => handleSelectChange('manager_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={isSaving || !isFormValid}>
              {isSaving ? 'Saving...' : 'Add Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project/Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name*</Label><Input name="name" value={form.name} onChange={handleFormChange} /></div>
            <div><Label>Description</Label><Input name="description" value={form.description} onChange={handleFormChange} /></div>
            <div><Label>Priority</Label><Input name="priority" value={form.priority} onChange={handleFormChange} /></div>
            <div><Label>Start Date*</Label><Input name="start_date" type="date" value={form.start_date} onChange={handleFormChange} /></div>
            <div><Label>End Date</Label><Input name="end_date" type="date" value={form.end_date} onChange={handleFormChange} /></div>
            <div><Label>Budget</Label><Input name="budget" type="number" value={form.budget} onChange={handleFormChange} /></div>
            <div>
              <Label>Manager*</Label>
              <Select value={form.manager_id} onValueChange={(value) => handleSelectChange('manager_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEdit} disabled={isSaving || !isFormValid}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;