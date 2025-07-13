import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, AlertTriangle, TrendingUp, Filter, Loader2 } from "lucide-react";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { useProjects } from "@/hooks/useProjects";

const Overview = () => {
  const { projects, tasks, issues, deliverables, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Dashboard Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-slate-600 text-xs mt-2">Failed to load dashboard data. Please refresh the page to try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const greenCount = projects.filter(p => p.status === "active").length;
  const amberCount = projects.filter(p => p.status === "planning").length;
  const redCount = projects.filter(p => p.status === "completed").length;

  const totalProjects = projects.length;
  const totalDeliverables = deliverables.length;
  const completedDeliverables = deliverables.filter(d => d.status === "completed").length;
  const totalBlockers = issues.filter(i => i.status === "open" && i.severity === "high").length;

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
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {tasks.filter(t => t.status === "completed").length} / {tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <ExecutiveSummary projects={projects.map(p => ({
          id: Number(p.id),
          name: p.name,
          type: "Projects" as const,
          status: p.status as "green" | "amber" | "red",
          progress: p.progress,
          dueDate: p.end_date || '',
          department: p.manager?.department || 'Unknown',
          lead: p.manager?.full_name || 'Unassigned',
          deliverables: 0,
          completedDeliverables: 0,
          blockers: 0,
          teamSize: 0,
          hoursAllocated: 0,
          hoursUsed: 0,
          lastCallDate: '',
          pmStatus: p.status as "green" | "amber" | "red",
          opsStatus: p.status as "green" | "amber" | "red",
          healthTrend: "constant" as const,
          monthlyDeliverables: [],
          pastWeeksStatus: []
        }))} />
      </div>
    </div>
  );
};

export default Overview;