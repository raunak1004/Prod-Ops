import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle, Plus, Search, Calendar, User } from "lucide-react";

interface Project {
  id: number;
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
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
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

// Mock issues data with additional fields
const mockIssues: Issue[] = [
  {
    id: 1,
    projectId: 2,
    projectName: "API Integration Platform",
    title: "Database connection timeout",
    description: "Intermittent connection timeouts causing API failures during peak hours",
    elaborateDescription: "We are experiencing intermittent database connection timeouts specifically during peak traffic hours (9 AM - 11 AM and 2 PM - 4 PM). This is causing cascading failures in our API endpoints, resulting in 504 Gateway Timeout errors for approximately 15% of requests during these periods. The issue appears to be related to connection pool exhaustion and may require optimization of our database connection management strategy. We have identified that the current connection pool size of 20 may be insufficient for our current load patterns. Additionally, some long-running queries are not being properly terminated, leading to connection leaks.",
    severity: "high",
    status: "open",
    assignee: "Michael Chen",
    dateCreated: "2024-06-25",
    department: "Engineering",
    eta: "2024-06-28"
  },
  {
    id: 2,
    projectId: 2,
    projectName: "API Integration Platform", 
    title: "Third-party API rate limiting",
    description: "External service rate limits blocking batch operations",
    elaborateDescription: "Our integration with the third-party payment processing API is being throttled due to rate limiting. The external service allows only 100 requests per minute, but our batch processing jobs require up to 500 requests during peak operations. This is causing significant delays in payment processing and order fulfillment. We need to implement a queue-based system with exponential backoff to respect the rate limits while maintaining system performance. The current implementation does not handle rate limit responses gracefully and simply fails the entire batch operation.",
    severity: "medium",
    status: "in-progress",
    assignee: "Sarah Johnson",
    dateCreated: "2024-06-24",
    department: "Engineering",
    eta: "2024-06-30"
  },
  {
    id: 3,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Data pipeline failing",
    description: "ETL process failing due to schema changes in source system",
    elaborateDescription: "The data pipeline responsible for customer analytics has been failing since the upstream CRM system updated their database schema on June 20th. The new schema includes additional fields and has changed the data types for several existing columns, breaking our ETL mappings. This is preventing the analytics dashboard from receiving updated customer data, making the reports stale and unreliable. We need to update our data transformation logic to accommodate the new schema and implement better schema validation to prevent future failures. The issue affects all customer segmentation reports and revenue analytics.",
    severity: "critical",
    status: "open",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-23",
    department: "Data",
    eta: "2024-06-27"
  },
  {
    id: 4,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Performance issues with large datasets",
    description: "Dashboard loading times exceed 30 seconds for enterprise customers",
    elaborateDescription: "Enterprise customers with large datasets (>1M records) are experiencing unacceptable dashboard loading times of 30-45 seconds. The current implementation loads all data client-side and performs filtering and aggregation in the browser, which is not scalable. We need to implement server-side pagination, pre-computed aggregations, and data virtualization to improve performance. The issue is particularly severe for customers in the retail and e-commerce sectors who have high transaction volumes. This is impacting customer satisfaction and retention rates.",
    severity: "high",
    status: "open",
    assignee: "David Park",
    dateCreated: "2024-06-22",
    department: "Data",
    eta: "2024-07-05"
  },
  {
    id: 5,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Missing user permissions module",
    description: "Role-based access control not implemented for sensitive data",
    elaborateDescription: "The customer analytics dashboard currently lacks proper role-based access control, allowing all users to view sensitive customer data regardless of their authorization level. This poses a significant security and compliance risk, especially for handling PII and financial data. We need to implement a comprehensive permissions system that restricts access to sensitive data based on user roles and departments. The system should support granular permissions at the field level and maintain audit logs for compliance purposes. This is blocking our SOC 2 certification process.",
    severity: "medium",
    status: "in-progress",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-21",
    department: "Data",
    eta: "2024-07-01"
  },
  {
    id: 6,
    projectId: 5,
    projectName: "Marketing Automation Tool",
    title: "Email template rendering issues",
    description: "Templates not displaying correctly in certain email clients",
    elaborateDescription: "Email templates generated by our marketing automation tool are not rendering correctly in Outlook 2016/2019 and some versions of Apple Mail. The issue is caused by CSS compatibility problems and the use of modern HTML features that are not supported by older email clients. Approximately 30% of our recipients use these problematic clients, resulting in broken layouts and poor user experience. We need to refactor the email templates to use more conservative HTML/CSS that is compatible with legacy email clients while maintaining visual appeal. This issue is affecting campaign effectiveness and brand perception.",
    severity: "medium",
    status: "open",
    assignee: "Jessica Wu",
    dateCreated: "2024-06-20",
    department: "Marketing",
    eta: "2024-06-29"
  }
];

const severityConfig = {
  low: { color: "bg-blue-500", label: "Low", textColor: "text-blue-700", bgColor: "bg-blue-50" },
  medium: { color: "bg-yellow-500", label: "Medium", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  high: { color: "bg-orange-500", label: "High", textColor: "text-orange-700", bgColor: "bg-orange-50" },
  critical: { color: "bg-red-500", label: "Critical", textColor: "text-red-700", bgColor: "bg-red-50" }
};

const statusConfig = {
  open: { color: "bg-red-500", label: "Open", textColor: "text-red-700" },
  "in-progress": { color: "bg-amber-500", label: "In Progress", textColor: "text-amber-700" },
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

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
    const matchesProject = filterProject === "all" || issue.projectId.toString() === filterProject;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeverity && matchesProject && matchesSearch;
  });

  // Issue statistics
  const issueStats = {
    total: issues.length,
    open: issues.filter(i => i.status === "open").length,
    inProgress: issues.filter(i => i.status === "in-progress").length,
    resolved: issues.filter(i => i.status === "resolved").length,
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length
  };

  // Department issue breakdown
  const departmentIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.department]) {
      acc[issue.department] = { total: 0, open: 0, critical: 0 };
    }
    acc[issue.department].total += 1;
    if (issue.status === "open") acc[issue.department].open += 1;
    if (issue.severity === "critical") acc[issue.department].critical += 1;
    return acc;
  }, {} as Record<string, any>);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailSidebarOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Open Issues</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.open}</div>
            <p className="text-xs text-slate-600 mt-1">
              {issueStats.critical} critical, {issueStats.high} high priority
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.inProgress}</div>
            <p className="text-xs text-slate-600 mt-1">Being actively worked on</p>
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

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issues by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(departmentIssues).map(([dept, stats]) => (
              <div key={dept} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{dept}</span>
                  <Badge variant="outline">{stats.total} issues</Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Open:</span>
                    <span className="font-medium text-red-600">{stats.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical:</span>
                    <span className="font-medium text-red-600">{stats.critical}</span>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Issue title" />
                  <Textarea placeholder="Issue description" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Create Issue</Button>
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
                  <SelectItem key={project.id} value={project.id.toString()}>
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                          <Badge 
                            className={`text-xs ${severityStyle.textColor} ${severityStyle.bgColor}`}
                          >
                            {severityStyle.label}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${statusStyle.textColor}`}
                          >
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                        <div className="text-xs text-slate-500">
                          Project: {issue.projectName} • Assignee: {issue.assignee} • Created: {new Date(issue.dateCreated).toLocaleDateString()}
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
                <p className="text-sm text-slate-600">{selectedIssue.projectName}</p>
              </div>

              {/* Elaborate Description */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-700 mb-2">Detailed Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedIssue.elaborateDescription || selectedIssue.description}
                </p>
              </div>

              {/* Timestamp */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <h4 className="font-medium text-slate-700">Timeline</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span className="text-slate-600">
                      {new Date(selectedIssue.dateCreated).toLocaleString()}
                    </span>
                  </div>
                  {selectedIssue.eta && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">ETA:</span>
                      <span className="text-slate-600">
                        {new Date(selectedIssue.eta).toLocaleDateString()}
                      </span>
                    </div>
                  )}
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
