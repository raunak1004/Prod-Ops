
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { ResourceOverview } from "@/components/ResourceOverview";
import { IssuesTracker } from "@/components/IssuesTracker";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { SeatAllocation } from "@/components/SeatAllocation";
import { projectsAndProducts } from "@/data/projectsData";

const statusColors = {
  green: "bg-green-500",
  amber: "bg-amber-500", 
  red: "bg-red-500"
};

const statusLabels = {
  green: "On Track",
  amber: "At Risk",
  red: "Delayed"
};

const Index = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  const [projectsData, setProjectsData] = useState(projectsAndProducts);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Debug: Ensure the component is using the updated code
  console.log("Index component loaded with tabs:", activeTab);

  const handleStatusUpdate = (projectId: number, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => {
    setProjectsData(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, [statusType]: newStatus }
          : project
      )
    );
  };
  
  // Filter projects based on filters
  const filteredProjects = projectsData.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
    return true;
  });

  const greenCount = projectsData.filter(p => p.status === "green").length;
  const amberCount = projectsData.filter(p => p.status === "amber").length;
  const redCount = projectsData.filter(p => p.status === "red").length;

  const totalProjects = projectsData.length;
  const totalDeliverables = projectsData.reduce((sum, p) => sum + p.deliverables, 0);
  const completedDeliverables = projectsData.reduce((sum, p) => sum + p.completedDeliverables, 0);
  const totalBlockers = projectsData.reduce((sum, p) => sum + p.blockers, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Product Operations Dashboard</h1>
            <p className="text-slate-600 mt-1">Executive overview of all projects and products</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Badge variant="outline" className="text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards - Only show on overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalProjects}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-600">{greenCount} On Track</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-slate-600">{amberCount} At Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-600">{redCount} Delayed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Deliverables Progress</CardTitle>
                  <Calendar className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {completedDeliverables}/{totalDeliverables}
                </div>
                <Progress value={(completedDeliverables / totalDeliverables) * 100} className="mt-2" />
                <p className="text-xs text-slate-600 mt-1">
                  {Math.round((completedDeliverables / totalDeliverables) * 100)}% Complete
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Blockers</CardTitle>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalBlockers}</div>
                <p className="text-xs text-slate-600 mt-2">Requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Resource Utilization</CardTitle>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round((projectsData.reduce((sum, p) => sum + p.hoursUsed, 0) / projectsData.reduce((sum, p) => sum + p.hoursAllocated, 0)) * 100)}%
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {projectsData.reduce((sum, p) => sum + p.hoursUsed, 0)}h / {projectsData.reduce((sum, p) => sum + p.hoursAllocated, 0)}h allocated
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content based on active tab */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <ExecutiveSummary projects={projectsData} />
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Projects and Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage all your active projects and products
                  </p>
                </div>
                <TaskFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <ResourceOverview projects={projectsData} />
          )}

          {activeTab === "seats" && (
            <SeatAllocation />
          )}

          {activeTab === "escalation" && (
            <IssuesTracker projects={projectsData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
