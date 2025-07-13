import React, { useState } from 'react';
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

interface Project {
  id: string;
  name: string;
  status: "green" | "amber" | "red";
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
  id: number;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  severity: "Sev1" | "Sev2" | "Sev3" | "Incident";
  status: "unresolved" | "resolved";
  assignee: string;
  dateCreated: string;
  dateResolved?: string;
  department: string;
  eta?: string;
  elaborateDescription?: string;
}

interface IssuesTrackerProps {
  projects: Project[];
}

// Mock issues data with synced project names
const mockIssues: Issue[] = [
  {
    id: 1,
    projectId: "2",
    projectName: "E-commerce Platform Redesign",
    title: "Database connection timeout",
    description: "Intermittent connection timeouts causing API failures during peak hours",
    elaborateDescription: "We are experiencing intermittent database connection timeouts specifically during peak traffic hours (9 AM - 11 AM and 2 PM - 4 PM). This is causing cascading failures in our API endpoints, resulting in 504 Gateway Timeout errors for approximately 15% of requests during these periods. The issue appears to be related to connection pool exhaustion and may require optimization of our database connection management strategy. We have identified that the current connection pool size of 20 may be insufficient for our current load patterns. Additionally, some long-running queries are not being properly terminated, leading to connection leaks.",
    severity: "Sev1",
    status: "unresolved",
    assignee: "Michael Chen",
    dateCreated: "2024-06-25",
    department: "Engineering",
    eta: "2024-06-28"
  },
  {
    id: 2,
    projectId: "3",
    projectName: "Customer Analytics Dashboard", 
    title: "Third-party API rate limiting",
    description: "External service rate limits blocking batch operations",
    elaborateDescription: "Our integration with the third-party payment processing API is being throttled due to rate limiting. The external service allows only 100 requests per minute, but our batch processing jobs require up to 500 requests during peak operations. This is causing significant delays in payment processing and order fulfillment. We need to implement a queue-based system with exponential backoff to respect the rate limits while maintaining system performance. The current implementation does not handle rate limit responses gracefully and simply fails the entire batch operation.",
    severity: "Sev2",
    status: "unresolved",
    assignee: "Sarah Johnson",
    dateCreated: "2024-06-24",
    department: "Engineering",
    eta: "2024-06-30"
  },
  {
    id: 3,
    projectId: "4",
    projectName: "Mobile App Development",
    title: "Data pipeline failing",
    description: "ETL process failing due to schema changes in source system",
    elaborateDescription: "The data pipeline responsible for customer analytics has been failing since the upstream CRM system updated their database schema on June 20th. The new schema includes additional fields and has changed the data types for several existing columns, breaking our ETL mappings. This is preventing the analytics dashboard from receiving updated customer data, making the reports stale and unreliable. We need to update our data transformation logic to accommodate the new schema and implement better schema validation to prevent future failures. The issue affects all customer segmentation reports and revenue analytics.",
    severity: "Incident",
    status: "unresolved",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-23",
    department: "Data",
    eta: "2024-06-27"
  },
  {
    id: 4,
    projectId: "5",
    projectName: "Marketing Automation Tool",
    title: "Performance issues with large datasets",
    description: "Dashboard loading times exceed 30 seconds for enterprise customers",
    elaborateDescription: "Enterprise customers with large datasets (>1M records) are experiencing unacceptable dashboard loading times of 30-45 seconds. The current implementation loads all data client-side and performs filtering and aggregation in the browser, which is not scalable. We need to implement server-side pagination, pre-computed aggregations, and data virtualization to improve performance. The issue is particularly severe for customers in the retail and e-commerce sectors who have high transaction volumes. This is impacting customer satisfaction and retention rates.",
    severity: "Sev1",
    status: "unresolved",
    assignee: "David Park",
    dateCreated: "2024-06-22",
    department: "Data",
    eta: "2024-07-05"
  },
  {
    id: 5,
    projectId: "6",
    projectName: "AI-Powered Chatbot",
    title: "Missing user permissions module",
    description: "Role-based access control not implemented for sensitive data",
    elaborateDescription: "The customer analytics dashboard currently lacks proper role-based access control, allowing all users to view sensitive customer data regardless of their authorization level. This poses a significant security and compliance risk, especially for handling PII and financial data. We need to implement a comprehensive permissions system that restricts access to sensitive data based on user roles and departments. The system should support granular permissions at the field level and maintain audit logs for compliance purposes. This is blocking our SOC 2 certification process.",
    severity: "Sev2",
    status: "resolved",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-21",
    department: "Data",
    eta: "2024-07-01"
  },
  {
    id: 6,
    projectId: "7",
    projectName: "Cloud Infrastructure Migration",
    title: "Email template rendering issues",
    description: "Templates not displaying correctly in certain email clients",
    elaborateDescription: "Email templates generated by our marketing automation tool are not rendering correctly in Outlook 2016/2019 and some versions of Apple Mail. The issue is caused by CSS compatibility problems and the use of modern HTML features that are not supported by older email clients. Approximately 30% of our recipients use these problematic clients, resulting in broken layouts and poor user experience. We need to refactor the email templates to use more conservative HTML/CSS that is compatible with legacy email clients while maintaining visual appeal. This issue is affecting campaign effectiveness and brand perception.",
    severity: "Sev2",
    status: "resolved",
    assignee: "Jessica Wu",
    dateCreated: "2024-06-20",
    department: "Marketing",
    eta: "2024-06-29"
  }
];

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

export const IssuesTracker: React.FC<IssuesTrackerProps> = ({ projects }) => {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
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

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
    const matchesProject = filterProject === "all" || issue.projectId === filterProject;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.projectName.toLowerCase().includes(searchTerm.toLowerCase());
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
    const project = projects.find(p => p.id === issue.projectId);
    const projectName = project?.name || issue.projectName;
    
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

  const handleStatusUpdate = (issueId: number, newStatus: "unresolved" | "resolved", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the issue click
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: newStatus, dateResolved: newStatus === "resolved" ? new Date().toISOString() : undefined }
          : issue
      )
    );
  };

  const handleSeverityUpdate = (issueId: number, newSeverity: "Sev1" | "Sev2" | "Sev3" | "Incident") => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId 
          ? { ...issue, severity: newSeverity }
          : issue
      )
    );
  };

  const handleTimelineEdit = () => {
    setIsEditingTimeline(true);
  };

  const handleTimelineSave = () => {
    if (selectedIssue) {
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === selectedIssue.id 
            ? { ...issue, eta: editedEta }
            : issue
        )
      );
      setSelectedIssue(prev => prev ? { ...prev, eta: editedEta } : null);
    }
    setIsEditingTimeline(false);
  };

  const handleTimelineCancel = () => {
    setEditedEta(selectedIssue?.eta || "");
    setIsEditingTimeline(false);
  };

  const handleCreateIssue = () => {
    if (!newIssue.title || !newIssue.description || !newIssue.projectId || !newIssue.severity || !newIssue.assignee) {
      return; // Basic validation
    }

    const project = projects.find(p => p.id === newIssue.projectId);
    const createdIssue: Issue = {
      id: Math.max(...issues.map(i => i.id)) + 1,
      projectId: newIssue.projectId,
      projectName: project?.name || "",
      title: newIssue.title,
      description: newIssue.description,
      severity: newIssue.severity as "Sev1" | "Sev2" | "Sev3" | "Incident",
      status: "unresolved",
      assignee: newIssue.assignee,
      dateCreated: new Date().toISOString(),
      department: project?.department || "Engineering",
      eta: newIssue.eta?.toISOString().split('T')[0]
    };

    setIssues(prev => [...prev, createdIssue]);
    
    // Reset form
    setNewIssue({
      title: "",
      description: "",
      projectId: "",
      severity: "",
      assignee: "",
      eta: undefined
    });
    
    setIsAddDialogOpen(false);
  };

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
                          Project: {projects.find(p => p.id === issue.projectId)?.name || issue.projectName} • Assignee: {issue.assignee} • Created: {new Date(issue.dateCreated).toLocaleDateString()}
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
                    {projects.find(p => p.id === selectedIssue.projectId)?.name || selectedIssue.projectName}
                  </p>
                </div>

              {/* Elaborate Description */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-700 mb-2">Detailed Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedIssue.elaborateDescription || selectedIssue.description}
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
                      {new Date(selectedIssue.dateCreated).toLocaleString()}
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
                  {selectedIssue.dateResolved && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Resolved:</span>
                      <span className="text-slate-600">
                        {new Date(selectedIssue.dateResolved).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignee */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <h4 className="font-medium text-slate-700">Assignee</h4>
                </div>
                <p className="text-sm text-slate-600">{selectedIssue.assignee}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedIssue.department} Department</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
