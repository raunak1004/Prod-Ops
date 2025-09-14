import React, { useState } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { kekaApiService, type KekaProject } from "@/services/kekaApi";

const Projects = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  // Only call useProjects once and destructure all needed values
  const {
    projects,
    loading,
    error,
    updateProjectStatus,
    deliverables,
    addProject,
    editProject,
    refetch,
    issues
  } = useProjects();
  const { employees } = useEmployees();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'not-started',
    pm_status: 'not-started',
    ops_status: 'not-started',
    priority: '',
    start_date: '',
    end_date: '',
    budget: '',
    manager_id: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (projectId: string, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => {
    try {
      // Map UI status type to database field name
      const dbStatusType = statusType === 'pmStatus' ? 'pm_status' : statusType === 'opsStatus' ? 'ops_status' : 'status';
      await updateProjectStatus(projectId, newStatus, dbStatusType as 'status' | 'pm_status' | 'ops_status');
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };
  
  // Map status from DB to UI values
  const mapStatusToUIStatus = (dbStatus: string): "green" | "amber" | "red" | "not-started" => {
    switch (dbStatus?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'green':
        return 'green';
      case 'planning':
      case 'pending':
      case 'amber':
        return 'amber';
      case 'on-hold':
      case 'cancelled':
      case 'red':
        return 'red';
      case 'not-started':
        return 'not-started';
      default:
        return 'not-started';
    }
  };

  // Transform projects to match the legacy format for ProjectCard component
  const transformedProjects = React.useMemo(() => projects.map(project => {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate deliverables for this project for the current month only
    const projectDeliverables = deliverables.filter(d => d.project_id === project.id && d.due_date && new Date(d.due_date).getMonth() === currentMonth && new Date(d.due_date).getFullYear() === currentYear);
    const completedDeliverables = projectDeliverables.filter(d => 
      d.status === 'completed' || d.status === 'done'
    ).length;
    const totalDeliverables = projectDeliverables.length;
    
    // Calculate blockers for this project
    const projectBlockers = issues.filter(i => i.project_id === project.id && i.status === 'open' && i.severity === 'high').length;
    // Calculate team size from deliverables assignees
    const teamSize = new Set(projectDeliverables.map(d => d.assignee_name)).size;
    // Calculate progress as percentage of completed deliverables for current month
    const progressPercentage = totalDeliverables > 0 ? 
      Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

    return {
      id: project.id, // Use full UUID instead of converting to number
      originalId: project.id, // Keep original ID for navigation
      name: project.name,
      type: "Projects" as const,
      status: mapStatusToUIStatus(project.status),
      progress: progressPercentage,
      dueDate: project.end_date || '',
      department: project.manager?.department || 'Unknown',
      lead: project.manager?.full_name || 'Unassigned',
      deliverables: totalDeliverables,
      completedDeliverables: completedDeliverables,
      blockers: projectBlockers,
      teamSize: teamSize,
      hoursAllocated: 0,
      hoursUsed: 0,
      lastCallDate: new Date(project.updated_at).toISOString().split('T')[0],
      pmStatus: mapStatusToUIStatus(project.pm_status || 'not-started'),
      opsStatus: mapStatusToUIStatus(project.ops_status || 'not-started'),
      healthTrend: "constant" as const,
      monthlyDeliverables: [],
      pastWeeksStatus: []
    };
  }), [projects, deliverables, issues]);
  
  // Filter projects based on filters - also use useMemo to prevent unnecessary re-calculations
  const filteredProjects = React.useMemo(() => transformedProjects.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
    return true;
  }), [transformedProjects, filters]);

  const handleOpenAdd = () => {
    setForm({
      name: '', description: '', status: 'not-started', pm_status: 'not-started', ops_status: 'not-started', priority: '', start_date: '', end_date: '', budget: '', manager_id: ''
    });
    setIsAddDialogOpen(true);
  };
  const handleOpenEdit = (project) => {
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
  };
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };
  const isFormValid = form.name && form.manager_id && form.start_date && (!form.budget || !isNaN(Number(form.budget))) && (!form.start_date || !form.end_date || new Date(form.start_date) <= new Date(form.end_date));

  const handleAdd = async () => {
    // Robust validation - only Name, Manager ID, and Start date are mandatory
    if (!form.name) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    if (!form.manager_id) {
      toast({ title: "Validation Error", description: "Manager is required.", variant: "destructive" });
      return;
    }
    if (!form.start_date) {
      toast({ title: "Validation Error", description: "Start date is required.", variant: "destructive" });
      return;
    }
    if (form.budget && isNaN(Number(form.budget))) {
      toast({ title: "Validation Error", description: "Budget must be a valid number.", variant: "destructive" });
      return;
    }
    if (form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      toast({ title: "Validation Error", description: "Start date must be before or equal to end date.", variant: "destructive" });
      return;
    }
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
      setForm({
        name: '', description: '', status: 'not-started', pm_status: 'not-started', ops_status: 'not-started', priority: '', start_date: '', end_date: '', budget: '', manager_id: ''
      });
      refetch();
      toast({ title: "Project Added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  const handleEdit = async () => {
    // Robust validation - only Name, Manager ID, and Start date are mandatory
    if (!form.name) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    if (!form.manager_id) {
      toast({ title: "Validation Error", description: "Manager ID is required.", variant: "destructive" });
      return;
    }
    if (!form.start_date) {
      toast({ title: "Validation Error", description: "Start Date is required.", variant: "destructive" });
      return;
    }
    if (form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      toast({ title: "Validation Error", description: "Start Date must be before or equal to End Date.", variant: "destructive" });
      return;
    }
    if (form.budget && isNaN(Number(form.budget))) {
      toast({ title: "Validation Error", description: "Budget must be a valid number.", variant: "destructive" });
      return;
    }
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
      setForm({
        name: '', description: '', status: 'not-started', pm_status: 'not-started', ops_status: 'not-started', priority: '', start_date: '', end_date: '', budget: '', manager_id: ''
      });
      refetch();
      toast({ title: "Project Updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFromKeka = async () => {

    setIsImporting(true);
    try {
      const kekaProjects = await kekaApiService.fetchProjects();
      let importedCount = 0;

      for (const kekaProject of kekaProjects) {
        // Check if project already exists by name
        const existingProject = projects.find(p => 
          p.name.toLowerCase() === kekaProject.name.toLowerCase()
        );

        if (!existingProject) {
          // Find a manager by name or create with default manager
          const manager = employees.find(emp => 
            emp.full_name.toLowerCase().includes(kekaProject.manager?.name.toLowerCase() || '')
          );

          await addProject({
            name: kekaProject.name,
            description: kekaProject.description || '',
            status: kekaProject.status,
            pm_status: 'not-started',
            ops_status: 'not-started',
            priority: '',
            start_date: kekaProject.startDate || new Date().toISOString().split('T')[0],
            end_date: kekaProject.endDate || null,
            budget: kekaProject.budget || null,
            manager_id: manager?.id || employees[0]?.id || '',
            progress: kekaProject.progress || 0,
          });
          importedCount++;
        }
      }

      refetch();
      toast({
        title: "Import Successful",
        description: `Imported ${importedCount} new projects from Keka API.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Keka API",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading projects...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Note: do not block render on error; show inline banner instead

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects and Products</h1>
            <p className="text-slate-600 mt-1">Track and manage all your active projects and products</p>
          </div>
          <TaskFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleImportFromKeka}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Import from Keka"}
            </Button>
            <Button onClick={handleOpenAdd}>Add Project/Product</Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative">
            <ProjectCard 
              project={project} 
              onStatusUpdate={handleStatusUpdate}
            />
              <Button size="sm" className="absolute top-2 right-2 z-10" onClick={() => handleOpenEdit(project)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Project/Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input name="name" value={form.name} onChange={handleFormChange} /></div>
            <div><Label>Description</Label><Input name="description" value={form.description} onChange={handleFormChange} /></div>
            <div><Label>Status</Label><Input name="status" value={form.status} onChange={handleFormChange} /></div>
            <div><Label>PM Status</Label><Input name="pm_status" value={form.pm_status} onChange={handleFormChange} /></div>
            <div><Label>Ops Status</Label><Input name="ops_status" value={form.ops_status} onChange={handleFormChange} /></div>
            <div><Label>Priority</Label><Input name="priority" value={form.priority} onChange={handleFormChange} /></div>
            <div><Label>Start Date</Label><Input name="start_date" type="date" value={form.start_date} onChange={handleFormChange} /></div>
            <div><Label>End Date</Label><Input name="end_date" type="date" value={form.end_date} onChange={handleFormChange} /></div>
            <div><Label>Budget</Label><Input name="budget" type="number" value={form.budget} onChange={handleFormChange} /></div>
            <div>
              <Label>Manager</Label>
              <Select value={form.manager_id} onValueChange={(value) => handleSelectChange('manager_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={isSaving || !isFormValid}>{isSaving ? 'Saving...' : 'Add Project'}</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project/Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input name="name" value={form.name} onChange={handleFormChange} /></div>
            <div><Label>Description</Label><Input name="description" value={form.description} onChange={handleFormChange} /></div>
            <div><Label>Status</Label><Input name="status" value={form.status} onChange={handleFormChange} /></div>
            <div><Label>PM Status</Label><Input name="pm_status" value={form.pm_status} onChange={handleFormChange} /></div>
            <div><Label>Ops Status</Label><Input name="ops_status" value={form.ops_status} onChange={handleFormChange} /></div>
            <div><Label>Priority</Label><Input name="priority" value={form.priority} onChange={handleFormChange} /></div>
            <div><Label>Start Date</Label><Input name="start_date" type="date" value={form.start_date} onChange={handleFormChange} /></div>
            <div><Label>End Date</Label><Input name="end_date" type="date" value={form.end_date} onChange={handleFormChange} /></div>
            <div><Label>Budget</Label><Input name="budget" type="number" value={form.budget} onChange={handleFormChange} /></div>
            <div>
              <Label>Manager</Label>
              <Select value={form.manager_id} onValueChange={(value) => handleSelectChange('manager_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEdit} disabled={isSaving || !isFormValid}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;