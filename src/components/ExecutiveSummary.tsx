
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

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

interface ExecutiveSummaryProps {
  projects: Project[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ projects }) => {
  const departmentStats = projects.reduce((acc, project) => {
    if (!acc[project.department]) {
      acc[project.department] = {
        total: 0,
        green: 0,
        amber: 0,
        red: 0,
        avgProgress: 0,
        totalHours: 0,
        usedHours: 0
      };
    }
    acc[project.department].total += 1;
    acc[project.department][project.status] += 1;
    acc[project.department].avgProgress += project.progress;
    acc[project.department].totalHours += project.hoursAllocated;
    acc[project.department].usedHours += project.hoursUsed;
    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.keys(departmentStats).forEach(dept => {
    departmentStats[dept].avgProgress = Math.round(departmentStats[dept].avgProgress / departmentStats[dept].total);
  });

  const riskProjects = projects.filter(p => p.status === 'red' || p.blockers > 0);
  const upcomingDeadlines = projects
    .filter(p => {
      const daysToDeadline = Math.ceil((new Date(p.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysToDeadline <= 7 && daysToDeadline >= 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overallHealth = {
    green: projects.filter(p => p.status === 'green').length,
    amber: projects.filter(p => p.status === 'amber').length,
    red: projects.filter(p => p.status === 'red').length
  };

  const healthPercentage = Math.round((overallHealth.green / projects.length) * 100);

  return (
    <div className="space-y-6">
      {/* Executive Health Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Portfolio Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overallHealth.green}</div>
              <div className="text-sm text-slate-600 mt-1">On Track Projects</div>
              <div className="w-full bg-green-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(overallHealth.green / projects.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{overallHealth.amber}</div>
              <div className="text-sm text-slate-600 mt-1">At Risk Projects</div>
              <div className="w-full bg-amber-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(overallHealth.amber / projects.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{overallHealth.red}</div>
              <div className="text-sm text-slate-600 mt-1">Delayed Projects</div>
              <div className="w-full bg-red-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(overallHealth.red / projects.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Portfolio Health</span>
              <span className="text-lg font-bold text-slate-900">{healthPercentage}%</span>
            </div>
            <Progress value={healthPercentage} className="h-3" />
            <p className="text-xs text-slate-500 mt-2">
              {healthPercentage >= 75 ? 'Excellent' : healthPercentage >= 50 ? 'Good' : 'Needs Attention'} - 
              {overallHealth.green} of {projects.length} projects are on track
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentStats).map(([dept, stats]) => (
                <div key={dept} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{dept}</span>
                    <Badge variant="outline">{stats.total} projects</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">{stats.green}</div>
                      <div className="text-xs text-slate-500">Green</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-amber-600">{stats.amber}</div>
                      <div className="text-xs text-slate-500">Amber</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-red-600">{stats.red}</div>
                      <div className="text-xs text-slate-500">Red</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Avg Progress: {stats.avgProgress}%</span>
                    <span>Utilization: {Math.round((stats.usedHours / stats.totalHours) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Projects & Deadlines */}
        <div className="space-y-6">
          {/* High Risk Projects */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                High Risk Projects ({riskProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskProjects.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No high-risk projects
                </div>
              ) : (
                <div className="space-y-3">
                  {riskProjects.slice(0, 3).map(project => (
                    <div key={project.id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-900">{project.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {project.status === 'red' ? 'Delayed' : 'Blocked'}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        {project.department} • {project.blockers} blockers • {project.progress}% complete
                      </div>
                    </div>
                  ))}
                  {riskProjects.length > 3 && (
                    <div className="text-center text-xs text-slate-500">
                      +{riskProjects.length - 3} more projects need attention
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <TrendingDown className="w-4 h-4" />
                Upcoming Deadlines (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No deadlines in next 7 days
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map(project => {
                    const daysLeft = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={project.id} className="p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-slate-900">{project.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {daysLeft} days
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          Due: {new Date(project.dueDate).toLocaleDateString()} • {project.progress}% complete
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
