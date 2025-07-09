
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, AlertTriangle, TrendingUp, Clock, Filter } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { ResourceOverview } from "@/components/ResourceOverview";
import { IssuesTracker } from "@/components/IssuesTracker";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";

// Mock data for projects
const projects = [
  {
    id: 1,
    name: "Mobile App Redesign",
    status: "green" as const,
    progress: 85,
    dueDate: "2024-07-15",
    department: "Product",
    lead: "Sarah Johnson",
    deliverables: 8,
    completedDeliverables: 7,
    blockers: 0,
    teamSize: 6,
    hoursAllocated: 480,
    hoursUsed: 380
  },
  {
    id: 2,
    name: "API Integration Platform",
    status: "amber" as const,
    progress: 70,
    dueDate: "2024-07-10",
    department: "Engineering",
    lead: "Michael Chen",
    deliverables: 12,
    completedDeliverables: 8,
    blockers: 2,
    teamSize: 4,
    hoursAllocated: 600,
    hoursUsed: 520
  },
  {
    id: 3,
    name: "Customer Analytics Dashboard",
    status: "red" as const,
    progress: 45,
    dueDate: "2024-06-30",
    department: "Data",
    lead: "Emily Rodriguez",
    deliverables: 10,
    completedDeliverables: 4,
    blockers: 4,
    teamSize: 5,
    hoursAllocated: 400,
    hoursUsed: 350
  },
  {
    id: 4,
    name: "Security Compliance Update",
    status: "green" as const,
    progress: 90,
    dueDate: "2024-07-20",
    department: "Security",
    lead: "David Park",
    deliverables: 6,
    completedDeliverables: 5,
    blockers: 0,
    teamSize: 3,
    hoursAllocated: 320,
    hoursUsed: 280
  },
  {
    id: 5,
    name: "Marketing Automation Tool",
    status: "amber" as const,
    progress: 65,
    dueDate: "2024-07-12",
    department: "Marketing",
    lead: "Jessica Wu",
    deliverables: 9,
    completedDeliverables: 6,
    blockers: 1,
    teamSize: 4,
    hoursAllocated: 360,
    hoursUsed: 280
  }
];

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
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const filteredProjects = selectedFilter === "all" 
    ? projects 
    : projects.filter(project => project.status === selectedFilter);

  const greenCount = projects.filter(p => p.status === "green").length;
  const amberCount = projects.filter(p => p.status === "amber").length;
  const redCount = projects.filter(p => p.status === "red").length;

  const totalProjects = projects.length;
  const totalDeliverables = projects.reduce((sum, p) => sum + p.deliverables, 0);
  const completedDeliverables = projects.reduce((sum, p) => sum + p.completedDeliverables, 0);
  const totalBlockers = projects.reduce((sum, p) => sum + p.blockers, 0);

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

        {/* Key Metrics Cards */}
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
                {Math.round((projects.reduce((sum, p) => sum + p.hoursUsed, 0) / projects.reduce((sum, p) => sum + p.hoursAllocated, 0)) * 100)}%
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {projects.reduce((sum, p) => sum + p.hoursUsed, 0)}h / {projects.reduce((sum, p) => sum + p.hoursAllocated, 0)}h allocated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resource</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExecutiveSummary projects={projects} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Project Portfolio</h3>
              <div className="flex gap-2">
                <Button 
                  variant={selectedFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedFilter("all")}
                >
                  All ({totalProjects})
                </Button>
                <Button 
                  variant={selectedFilter === "green" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedFilter("green")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Green ({greenCount})
                </Button>
                <Button 
                  variant={selectedFilter === "amber" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedFilter("amber")}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Amber ({amberCount})
                </Button>
                <Button 
                  variant={selectedFilter === "red" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedFilter("red")}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Red ({redCount})
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <ResourceOverview projects={projects} />
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <IssuesTracker projects={projects} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
