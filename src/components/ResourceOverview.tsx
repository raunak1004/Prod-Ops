
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, TrendingUp, Zap } from "lucide-react";

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

interface ResourceOverviewProps {
  projects: Project[];
}

export const ResourceOverview: React.FC<ResourceOverviewProps> = ({ projects }) => {
  // Department resource analysis
  const departmentResources = projects.reduce((acc, project) => {
    if (!acc[project.department]) {
      acc[project.department] = {
        totalTeamMembers: 0,
        totalHours: 0,
        usedHours: 0,
        projects: 0,
        avgUtilization: 0
      };
    }
    acc[project.department].totalTeamMembers += project.teamSize;
    acc[project.department].totalHours += project.hoursAllocated;
    acc[project.department].usedHours += project.hoursUsed;
    acc[project.department].projects += 1;
    return acc;
  }, {} as Record<string, any>);

  // Calculate utilization percentages
  Object.keys(departmentResources).forEach(dept => {
    const dept_data = departmentResources[dept];
    dept_data.avgUtilization = Math.round((dept_data.usedHours / dept_data.totalHours) * 100);
  });

  // Overall resource metrics
  const totalTeamMembers = projects.reduce((sum, p) => sum + p.teamSize, 0);
  const totalHours = projects.reduce((sum, p) => sum + p.hoursAllocated, 0);
  const usedHours = projects.reduce((sum, p) => sum + p.hoursUsed, 0);
  const overallUtilization = Math.round((usedHours / totalHours) * 100);

  // Top performers and resource bottlenecks
  const overUtilizedDepts = Object.entries(departmentResources)
    .filter(([_, data]) => data.avgUtilization > 90)
    .map(([dept, data]) => ({ dept, ...data }));

  const underUtilizedDepts = Object.entries(departmentResources)
    .filter(([_, data]) => data.avgUtilization < 70)
    .map(([dept, data]) => ({ dept, ...data }));

  return (
    <div className="space-y-6">
      {/* Efficiency Score moved to Overview metrics row */}

      {/* Department Resource Allocation metric removed as requested */}

      {/* Resource Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Over-utilized Departments */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Over-Utilized Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overUtilizedDepts.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                All departments within healthy limits
              </div>
            ) : (
              <div className="space-y-3">
                {overUtilizedDepts.map(dept => (
                  <div key={dept.dept} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{dept.dept}</span>
                      <Badge variant="destructive">{dept.avgUtilization}%</Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      {dept.totalTeamMembers} team members • {dept.projects} projects
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Risk of burnout - consider redistributing workload
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Under-utilized Departments */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Available Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {underUtilizedDepts.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                All resources optimally utilized
              </div>
            ) : (
              <div className="space-y-3">
                {underUtilizedDepts.map(dept => (
                  <div key={dept.dept} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{dept.dept}</span>
                      <Badge variant="secondary">{dept.avgUtilization}%</Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      {dept.totalTeamMembers} team members • {dept.projects} projects
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Available for additional work or support
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
