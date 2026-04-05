import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Users, Mail, Phone, Loader2, Plus, Trash2, Edit2, Download } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Safely extract a display string from a field that may be a raw JSON object string
// e.g. '{"identifier":"...","title":"Admin"}' → "Admin"
function safeStr(val: string | null | undefined): string {
  if (!val) return '';
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === 'object') return parsed.title ?? parsed.name ?? '';
  } catch {}
  return val;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const EmployeesList = () => {
  const { employees, loading, error, refetch } = useEmployees();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    skills: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [allocations, setAllocations] = useState([]);

  // Fetch allocations from Supabase
  React.useEffect(() => {
    const fetchAllocations = async () => {
      const { data, error } = await supabase.from('allocations').select('*');
      if (!error && data) setAllocations(data);
    };
    fetchAllocations();
  }, []);

  // Helper to get live utilization for an employee
  const getEmployeeUtilization = (employeeId) => {
    return allocations.filter(a => a.employee_id === employeeId).reduce((sum, a) => sum + a.allocation, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading employees...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-64">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normalise position for display and filtering
  const roleCategories = ["All", ...new Set(employees.map(emp => safeStr(emp.position)).filter(Boolean))];

  const filteredEmployees = employees.filter(employee => {
    const name = employee.full_name || '';
    const email = employee.email || '';
    const position = safeStr(employee.position);
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || position === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getEmployeeCountByRole = (role: string) => {
    return employees.filter(emp => safeStr(emp.position) === role).length;
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, position, and department.",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('employees')
        .insert([{
          full_name: newEmployee.name,
          email: newEmployee.email,
          position: newEmployee.position,
          department: newEmployee.department,
          salary: newEmployee.salary ? parseFloat(newEmployee.salary) : null,
          skills: newEmployee.skills ? newEmployee.skills.split(',').map(s => s.trim()) : [],
          status: 'active',
          utilization_rate: 0
        }]);

      if (error) throw error;

      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added successfully.`
      });

      setNewEmployee({
        name: '',
        email: '',
        position: '',
        department: '',
        salary: '',
        skills: ''
      });
      setIsAddDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Error adding employee:', err);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditEmployee({
      ...employee,
      name: employee.full_name,
      position: safeStr(employee.position),
      department: safeStr(employee.department),
      skills: Array.isArray(employee.skills) ? employee.skills : [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editEmployee.name || !editEmployee.position || !editEmployee.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, position, and department.",
        variant: "destructive"
      });
      return;
    }
    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          full_name: editEmployee.name,
          email: editEmployee.email,
          position: editEmployee.position,
          department: editEmployee.department,
          salary: editEmployee.salary ? parseFloat(editEmployee.salary) : null,
          skills: editEmployee.skills ? editEmployee.skills.split(',').map(s => s.trim()) : [],
          status: editEmployee.status,
          utilization_rate: editEmployee.utilization_rate || 0,
          avatar_url: editEmployee.avatar_url,
          hire_date: editEmployee.hire_date,
          employee_id: editEmployee.employee_id,
          role: editEmployee.role,
          user_id: editEmployee.user_id
        })
        .eq('id', editEmployee.id);
      if (error) throw error;
      toast({ title: "Employee Updated", description: `${editEmployee.name} has been updated.` });
      setIsEditDialogOpen(false);
      setEditEmployee(null);
      refetch();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update employee.", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('employees').delete().eq('id', employeeId);
      if (error) throw error;
      toast({ title: "Employee Deleted", description: "Employee has been removed." });
      refetch();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportFromKeka = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('keka-employees');
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error ?? 'Unknown error from Keka');
      toast({
        title: "Import complete",
        description: `${data.inserted} added · ${data.updated} updated · ${data.skipped} skipped (${data.total} total from Keka).`,
      });
      refetch();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="text-center">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
          </CardContent>
        </Card>
        {roleCategories.slice(1, 6).map((role) => (
          <Card key={role} className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{role}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{getEmployeeCountByRole(role)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-slate-600 text-sm">{employees.length} employees total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImportFromKeka} disabled={isImporting}>
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Import from Keka
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  placeholder="e.g. Senior Developer"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  placeholder="Annual salary"
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={newEmployee.skills}
                  onChange={(e) => setNewEmployee({...newEmployee, skills: e.target.value})}
                  placeholder="React, TypeScript, Node.js (comma-separated)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddEmployee}
                  disabled={isAdding}
                  className="flex-1"
                >
                  {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Employee
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roleCategories.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="mx-auto h-10 w-10 mb-2" />
          <p className="text-sm">No employees found. Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => {
            const position   = safeStr(employee.position);
            const department = safeStr(employee.department);
            const utilization = getEmployeeUtilization(employee.id);
            return (
              <Card key={employee.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={employee.avatar_url ?? undefined} alt={employee.full_name} />
                      <AvatarFallback className="bg-blue-50 text-blue-700 font-medium text-sm">
                        {getInitials(employee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{employee.full_name}</p>
                      {position && <p className="text-xs text-slate-500 truncate">{position}</p>}
                      {department && <p className="text-xs text-slate-400 truncate">{department}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        className={`text-xs border-0 ${employee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {employee.status ?? 'active'}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditEmployee(employee)}>
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDeleteEmployee(employee.id)} disabled={isDeleting}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    {employee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.employee_id && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>ID: {employee.employee_id}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {employee.skills && employee.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {employee.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-1.5 py-0 h-5">{skill}</Badge>
                      ))}
                      {employee.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">+{employee.skills.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  {/* Utilization */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Utilization</span>
                      <span className={`font-medium ${utilization > 100 ? 'text-red-500' : utilization > 80 ? 'text-amber-500' : 'text-slate-700'}`}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-amber-400' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <div className="space-y-4 pt-1">
              {/* Name + Employee ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editEmployee.name}
                    onChange={e => setEditEmployee({ ...editEmployee, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-position">Position *</Label>
                  <Input
                    id="edit-position"
                    value={safeStr(editEmployee.position)}
                    onChange={e => setEditEmployee({ ...editEmployee, position: e.target.value })}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-department">Department *</Label>
                  <Input
                    id="edit-department"
                    value={safeStr(editEmployee.department)}
                    onChange={e => setEditEmployee({ ...editEmployee, department: e.target.value })}
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmployee.email || ''}
                  onChange={e => setEditEmployee({ ...editEmployee, email: e.target.value })}
                  placeholder="work@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-hire-date">Hire Date</Label>
                  <Input
                    id="edit-hire-date"
                    type="date"
                    value={editEmployee.hire_date || ''}
                    onChange={e => setEditEmployee({ ...editEmployee, hire_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editEmployee.status || 'active'}
                    onValueChange={v => setEditEmployee({ ...editEmployee, status: v })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-skills">Skills <span className="text-slate-400 font-normal">(comma-separated)</span></Label>
                <Input
                  id="edit-skills"
                  value={Array.isArray(editEmployee.skills) ? editEmployee.skills.join(', ') : (editEmployee.skills || '')}
                  onChange={e => setEditEmployee({ ...editEmployee, skills: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={handleUpdateEmployee} disabled={isEditing} className="flex-1">
                  {isEditing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isEditing}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};