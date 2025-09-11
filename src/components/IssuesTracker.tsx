import React, { useState, useEffect } from 'react';
import { useIssues } from '@/hooks/useIssues';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle, Plus, Search, Calendar, User, Edit3, Save, X, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  status: "green" | "amber" | "red" | "not-started";
  progress: number;
  dueDate: string;
  department: string;
  lead: string;
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
}

interface Issue {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: "Sev1" | "Sev2" | "Sev3" | "Incident";
  status: "unresolved" | "resolved";
  assigned_to: string;
  created_at: string;
  updated_at: string;
  eta?: string;
}

interface IssuesTrackerProps {
  projects: Project[];
  defaultProjectId?: string;
}

// Remove mockIssues, use only live data

const severityConfig = {
  Sev3: { color: "bg-blue-500", label: "Sev3", textColor: "text-blue-700", bgColor: "bg-blue-50" },
  Sev2: { color: "bg-yellow-500", label: "Sev2", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  Sev1: { color: "bg-orange-500", label: "Sev1", textColor: "text-orange-700", bgColor: "bg-orange-50" },
  Incident: { color: "bg-red-500", label: "Incident", textColor: "text-red-700", bgColor: "bg-red-50" }
};

const statusConfig = {
  unresolved: { color: "bg-red-500", label: "Unresolved", textColor: "text-red-700" },
  resolved: { color: "bg-green-500", label: "Resolved", textColor: "text-green-700" }
};

export const IssuesTracker: React.FC<IssuesTrackerProps & { useLiveData?: boolean }> = ({ projects, useLiveData = true, defaultProjectId }) => {
  const { issues, loading, error, addIssue, updateIssue, deleteIssue, refetchIssues } = useIssues();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>(projects.length === 1 ? projects[0].id : "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [editedEta, setEditedEta] = useState("");
  
  // Add Issue Form State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    projectId: "",
    severity: "",
    assignee: "",
    eta: undefined as Date | undefined
  });

  // If defaultProjectId is provided, set filterProject to it on mount
  useEffect(() => {
    if (defaultProjectId) {
      setFilterProject(defaultProjectId);
    }
  }, [defaultProjectId]);

  // Refetch issues when the page regains focus
  useEffect(() => {
    const onFocus = () => refetchIssues();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetchIssues]);

  const filteredIssues = issues
    .map(issue => ({
      ...issue,
      eta: issue.eta || '',
    }))
    .filter(issue => {
      const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
      const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
      const matchesProject = filterProject === "all" || issue.project_id === filterProject;
      const projectName = projects.find(p => p.id === issue.project_id)?.name || '';
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           projectName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSeverity && matchesProject && matchesSearch;
    });

  // Issue statistics
  const issueStats = {
    total: issues.length,
    unresolved: issues.filter(i => i.status === "unresolved").length,
    resolved: issues.filter(i => i.status === "resolved").length,
    incident: issues.filter(i => i.severity === "Incident").length,
    sev1: issues.filter(i => i.severity === "Sev1").length
  };

  // Project issue breakdown instead of department
  const projectIssues = issues.reduce((acc, issue) => {
    const project = projects.find(p => p.id === issue.project_id);
    const projectName = project?.name || '';
    if (!acc[projectName]) {
      acc[projectName] = { total: 0, unresolved: 0, incident: 0 };
    }
    acc[projectName].total += 1;
    if (issue.status === "unresolved") acc[projectName].unresolved += 1;
    if (issue.severity === "Incident") acc[projectName].incident += 1;
    return acc;
  }, {} as Record<string, { total: number; unresolved: number; incident: number }>);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setEditedEta(issue.eta || "");
    setIsEditingTimeline(false);
    setIsDetailSidebarOpen(true);
  };

  const handleStatusUpdate = (issueId: string, newStatus: "unresolved" | "resolved", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the issue click
    updateIssue(issueId, { status: newStatus });
  };

  const handleSeverityUpdate = (issueId: string, newSeverity: "Sev1" | "Sev2" | "Sev3" | "Incident") => {
    updateIssue(issueId, { severity: newSeverity });
  };

  const handleTimelineEdit = () => {
    setIsEditingTimeline(true);
  };

  const handleTimelineSave = () => {
    if (selectedIssue) {
      updateIssue(selectedIssue.id, { eta: editedEta });
    }
    setIsEditingTimeline(false);
  };

  const handleTimelineCancel = () => {
    setEditedEta(selectedIssue?.eta || "");
    setIsEditingTimeline(false);
  };

  const handleCreateIssue = async () => {
    if (!newIssue.title || !newIssue.description || !newIssue.projectId || !newIssue.severity || !newIssue.assignee) {
      return; // Basic validation
    }
    try {
      await addIssue({
        project_id: newIssue.projectId,
        title: newIssue.title,
        description: newIssue.description,
        severity: newIssue.severity as 'Sev1' | 'Sev2' | 'Sev3' | 'Incident',
        status: 'unresolved',
        assigned_to: newIssue.assignee,
        eta: newIssue.eta ? newIssue.eta.toISOString().split('T')[0] : undefined,
      });
      setNewIssue({
        title: "",
        description: "",
        projectId: "",
        severity: "",
        assignee: "",
        eta: undefined
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      // Optionally show error toast
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading issues...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Unresolved Issues</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.unresolved}</div>
            <p className="text-xs text-slate-600 mt-1">
              {issueStats.incident} incident, {issueStats.sev1} Sev1 priority
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Resolved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.resolved}</div>
            <p className="text-xs text-slate-600 mt-1">
              {Math.round((issueStats.resolved / issueStats.total) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Issues</CardTitle>
              <Plus className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.total}</div>
            <p className="text-xs text-slate-600 mt-1">All time tracked issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issues by Project/Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(projectIssues).map(([projectName, stats]) => (
              <div key={projectName} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{projectName}</span>
                  <Badge variant="outline">{stats.total} issues</Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Unresolved:</span>
                    <span className="font-medium text-red-600">{stats.unresolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incident:</span>
                    <span className="font-medium text-red-600">{stats.incident}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Issues & Blockers</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <Input 
                      placeholder="Issue title" 
                      value={newIssue.title}
                      onChange={(e) => setNewIssue(prev => ({...prev, title: e.target.value}))}
                    />
                    <Textarea 
                      placeholder="Issue description" 
                      value={newIssue.description}
                      onChange={(e) => setNewIssue(prev => ({...prev, description: e.target.value}))}
                      className="min-h-[100px]"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={newIssue.projectId} 
                        onValueChange={(value) => setNewIssue(prev => ({...prev, projectId: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={newIssue.severity} 
                        onValueChange={(value) => setNewIssue(prev => ({...prev, severity: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sev3">Sev3</SelectItem>
                          <SelectItem value="Sev2">Sev2</SelectItem>
                          <SelectItem value="Sev1">Sev1</SelectItem>
                          <SelectItem value="Incident">Incident</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Input 
                      placeholder="Assignee name" 
                      value={newIssue.assignee}
                      onChange={(e) => setNewIssue(prev => ({...prev, assignee: e.target.value}))}
                    />
                  </div>

                  {/* Timeline Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <h4 className="font-medium text-slate-700">Timeline</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-600">
                          {new Date().toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">ETA:</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !newIssue.eta && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newIssue.eta ? format(newIssue.eta, "PPP") : <span>Set ETA date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={newIssue.eta}
                              onSelect={(date) => setNewIssue(prev => ({...prev, eta: date}))}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCreateIssue}
                    disabled={!newIssue.title || !newIssue.description || !newIssue.projectId || !newIssue.severity || !newIssue.assignee}
                  >
                    Create Issue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Incident">Incident</SelectItem>
                <SelectItem value="Sev1">Sev1</SelectItem>
                <SelectItem value="Sev2">Sev2</SelectItem>
                <SelectItem value="Sev3">Sev3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No issues found matching the current filters</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const severityStyle = severityConfig[issue.severity];
                const statusStyle = statusConfig[issue.status];
                
                return (
                  <div 
                    key={issue.id} 
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">{issue.title}</h4>
                          <Select value={issue.severity} onValueChange={(newSeverity: any) => handleSeverityUpdate(issue.id, newSeverity)}>
                            <SelectTrigger 
                              className={`h-6 w-auto text-xs ${severityStyle.textColor} ${severityStyle.bgColor} border-none hover:bg-opacity-80`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sev3">Sev3</SelectItem>
                              <SelectItem value="Sev2">Sev2</SelectItem>
                              <SelectItem value="Sev1">Sev1</SelectItem>
                              <SelectItem value="Incident">Incident</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${statusStyle.textColor} cursor-pointer hover:bg-slate-100 transition-colors`}
                            onClick={(e) => handleStatusUpdate(issue.id, issue.status === "unresolved" ? "resolved" : "unresolved", e)}
                          >
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                        <div className="text-xs text-slate-500">
                          Project: {projects.find(p => p.id === issue.project_id)?.name || ''} • Assignee: {issue.assigned_to || ''} • Created: {new Date(issue.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issue Detail Sidebar */}
      <Sheet open={isDetailSidebarOpen} onOpenChange={setIsDetailSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Issue Details</SheetTitle>
          </SheetHeader>
          
          {selectedIssue && (
            <div className="space-y-6 mt-6">
              {/* Issue Title and Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {selectedIssue.title}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    className={`text-xs ${severityConfig[selectedIssue.severity].textColor} ${severityConfig[selectedIssue.severity].bgColor}`}
                  >
                    {severityConfig[selectedIssue.severity].label}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${statusConfig[selectedIssue.status].textColor}`}
                  >
                    {statusConfig[selectedIssue.status].label}
                  </Badge>
                </div>
              </div>

                {/* Project Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-slate-700 mb-2">Project</h4>
                  <p className="text-sm text-slate-600">
                    {projects.find(p => p.id === selectedIssue.project_id)?.name || ''}
                  </p>
                </div>

              {/* Elaborate Description */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-700 mb-2">Detailed Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Timeline - Editable */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h4 className="font-medium text-slate-700">Timeline</h4>
                  </div>
                  {!isEditingTimeline && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTimelineEdit}
                      className="h-7 px-2"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span className="text-slate-600">
                      {new Date(selectedIssue.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ETA:</span>
                    {isEditingTimeline ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={editedEta}
                          onChange={(e) => setEditedEta(e.target.value)}
                          className="h-7 w-32 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={handleTimelineSave}
                          className="h-7 px-2"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleTimelineCancel}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-slate-600">
                        {selectedIssue.eta ? new Date(selectedIssue.eta).toLocaleDateString() : 'Not set'}
                      </span>
                    )}
                  </div>
                  {/* No dateResolved field in Issue; skip resolved date */}
                </div>
              </div>

              {/* Assignee */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <h4 className="font-medium text-slate-700">Assignee</h4>
                </div>
                <p className="text-sm text-slate-600">{selectedIssue.assigned_to || ''}</p>
                <p className="text-xs text-slate-500 mt-1">{projects.find(p => p.id === selectedIssue.project_id)?.department || ''} Department</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
