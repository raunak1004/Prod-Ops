
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, TrendingUp, Zap } from "lucide-react";

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
      {/* Resource Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Team Members</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTeamMembers}</div>
            <p className="text-xs text-slate-600 mt-1">Across {projects.length} active projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Hours Utilized</CardTitle>
              <Clock className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{usedHours}</div>
            <p className="text-xs text-slate-600 mt-1">of {totalHours} allocated hours</p>
            <Progress value={overallUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Utilization</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{overallUtilization}%</div>
            <p className={`text-xs mt-1 ${overallUtilization > 85 ? 'text-amber-600' : overallUtilization > 95 ? 'text-red-600' : 'text-green-600'}`}>
              {overallUtilization > 95 ? 'Over-utilized' : overallUtilization > 85 ? 'High utilization' : 'Healthy utilization'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Efficiency Score</CardTitle>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round((projects.reduce((sum, p) => sum + p.progress, 0) / projects.length))}%
            </div>
            <p className="text-xs text-slate-600 mt-1">Average project progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Resource Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Resource Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(departmentResources).map(([dept, data]) => (
              <div key={dept} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{dept}</h4>
                  <Badge 
                    variant={data.avgUtilization > 90 ? "destructive" : data.avgUtilization > 80 ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {data.avgUtilization}% utilized
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{data.totalTeamMembers}</div>
                    <div className="text-xs text-slate-600">Team Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{data.projects}</div>
                    <div className="text-xs text-slate-600">Projects</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{Math.round(data.usedHours / data.totalTeamMembers)}</div>
                    <div className="text-xs text-slate-600">Avg Hours/Person</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Resource Utilization</span>
                    <span className="text-sm font-medium">{data.usedHours}h / {data.totalHours}h</span>
                  </div>
                  <Progress value={data.avgUtilization} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
