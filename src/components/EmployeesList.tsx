import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Users, Mail, Phone, Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  // Get unique roles from employees data
  const roleCategories = ["All", ...new Set(employees.map(emp => emp.position))];

  const filteredEmployees = employees.filter(employee => {
    const name = employee.full_name || '';
    const email = employee.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || employee.position === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getEmployeeCountByRole = (role: string) => {
    return employees.filter(emp => emp.position === role).length;
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
      salary: employee.salary?.toString() || '',
      skills: employee.skills?.join(', ') || ''
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
                  <AvatarFallback>
                    {employee.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{employee.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => handleEditEmployee(employee)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteEmployee(employee.id)} disabled={isDeleting}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID: {employee.employee_id}</span>
              </div>
              {employee.skills && employee.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {employee.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {employee.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Utilization</span>
                  <span className="text-sm font-medium">{getEmployeeUtilization(employee.id)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getEmployeeUtilization(employee.id)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No employees found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input id="edit-name" value={editEmployee.name} onChange={e => setEditEmployee({ ...editEmployee, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" value={editEmployee.email || ''} onChange={e => setEditEmployee({ ...editEmployee, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-position">Position *</Label>
                <Input id="edit-position" value={editEmployee.position || ''} onChange={e => setEditEmployee({ ...editEmployee, position: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Input id="edit-department" value={editEmployee.department || ''} onChange={e => setEditEmployee({ ...editEmployee, department: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-salary">Salary</Label>
                <Input id="edit-salary" type="number" value={editEmployee.salary || ''} onChange={e => setEditEmployee({ ...editEmployee, salary: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-skills">Skills</Label>
                <Input id="edit-skills" value={editEmployee.skills || ''} onChange={e => setEditEmployee({ ...editEmployee, skills: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Input id="edit-status" value={editEmployee.status || ''} onChange={e => setEditEmployee({ ...editEmployee, status: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-utilization">Utilization Rate</Label>
                <Input id="edit-utilization" type="number" value={editEmployee.utilization_rate || 0} onChange={e => setEditEmployee({ ...editEmployee, utilization_rate: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="edit-avatar">Avatar URL</Label>
                <Input id="edit-avatar" value={editEmployee.avatar_url || ''} onChange={e => setEditEmployee({ ...editEmployee, avatar_url: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-hire-date">Hire Date</Label>
                <Input id="edit-hire-date" type="date" value={editEmployee.hire_date || ''} onChange={e => setEditEmployee({ ...editEmployee, hire_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-employee-id">Employee ID</Label>
                <Input id="edit-employee-id" value={editEmployee.employee_id || ''} onChange={e => setEditEmployee({ ...editEmployee, employee_id: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Input id="edit-role" value={editEmployee.role || ''} onChange={e => setEditEmployee({ ...editEmployee, role: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-user-id">User ID</Label>
                <Input id="edit-user-id" value={editEmployee.user_id || ''} onChange={e => setEditEmployee({ ...editEmployee, user_id: e.target.value })} />
              </div>
              <div className="flex gap-2">
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