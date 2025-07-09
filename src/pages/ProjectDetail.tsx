import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, User, Clock } from "lucide-react";

// Mock data - in a real app, this would come from an API
const mockProjects = [
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
    hoursUsed: 380,
    lastCallDate: "2024-07-08",
    pmStatus: "green" as const,
    opsStatus: "green" as const,
    healthTrend: "improving" as const,
    monthlyDeliverables: [
      { id: 1, task: "UI/UX Design Completion", dueDate: "2024-07-15", comments: "Final review in progress" },
      { id: 2, task: "Backend API Integration", dueDate: "2024-07-20", comments: "On track" },
      { id: 3, task: "Testing Phase", dueDate: "2024-07-25", comments: "Waiting for development completion" }
    ]
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
    hoursUsed: 520,
    lastCallDate: "2024-07-05",
    pmStatus: "amber" as const,
    opsStatus: "red" as const,
    healthTrend: "declining" as const,
    monthlyDeliverables: [
      { id: 1, task: "Database Schema Migration", dueDate: "2024-07-12", comments: "Delayed due to complexity" },
      { id: 2, task: "Third-party API Testing", dueDate: "2024-07-18", comments: "Dependencies blocking progress" },
      { id: 3, task: "Security Audit", dueDate: "2024-07-22", comments: "Scheduled for next week" }
    ]
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
    hoursUsed: 350,
    lastCallDate: "2024-07-07",
    pmStatus: "red" as const,
    opsStatus: "red" as const,
    healthTrend: "constant" as const,
    monthlyDeliverables: [
      { id: 1, task: "Data Pipeline Setup", dueDate: "2024-07-14", comments: "Major technical challenges" },
      { id: 2, task: "Report Generation Module", dueDate: "2024-07-21", comments: "Waiting for data pipeline" },
      { id: 3, task: "User Interface Development", dueDate: "2024-07-28", comments: "Resource constraints" }
    ]
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
    hoursUsed: 280,
    lastCallDate: "2024-07-06",
    pmStatus: "green" as const,
    opsStatus: "green" as const,
    healthTrend: "improving" as const,
    monthlyDeliverables: [
      { id: 1, task: "Security Policy Updates", dueDate: "2024-07-16", comments: "Nearly complete" },
      { id: 2, task: "Vulnerability Assessment", dueDate: "2024-07-19", comments: "Scheduled for this week" },
      { id: 3, task: "Compliance Documentation", dueDate: "2024-07-24", comments: "Ready for review" }
    ]
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
    hoursUsed: 280,
    lastCallDate: "2024-07-04",
    pmStatus: "green" as const,
    opsStatus: "amber" as const,
    healthTrend: "constant" as const,
    monthlyDeliverables: [
      { id: 1, task: "Email Campaign Builder", dueDate: "2024-07-17", comments: "Feature complete, testing needed" },
      { id: 2, task: "Analytics Dashboard", dueDate: "2024-07-23", comments: "UI development in progress" },
      { id: 3, task: "Integration Testing", dueDate: "2024-07-26", comments: "Planned after feature completion" }
    ]
  }
];

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "On Track",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  amber: {
    color: "bg-amber-500", 
    label: "At Risk",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  red: {
    color: "bg-red-500",
    label: "Delayed", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
};

const trendConfig = {
  improving: {
    icon: TrendingUp,
    color: "text-green-600",
    label: "Improving"
  },
  declining: {
    icon: TrendingDown,
    color: "text-red-600",
    label: "Declining"
  },
  constant: {
    icon: Minus,
    color: "text-amber-600",
    label: "Constant"
  }
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const project = mockProjects.find(p => p.id === parseInt(id || '0'));
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const trendData = trendConfig[project.healthTrend];
  const TrendIcon = trendData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Pocket Notebook Style Container */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Notebook Header - Rings/Binding Effect */}
          <div className="bg-slate-100 border-b border-slate-200 p-1">
            <div className="flex justify-center space-x-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-slate-300 shadow-inner"></div>
              ))}
            </div>
          </div>

          {/* Project Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{project.department}</Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    {project.lead}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <TrendIcon className={`w-5 h-5 ${trendData.color}`} />
                  <span className={`text-sm font-medium ${trendData.color}`}>
                    {trendData.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500">Health Trend (2 weeks)</div>
              </div>
            </div>

            {/* Status Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">PM Status</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pmConfig.bgColor} ${pmConfig.textColor}`}>
                  <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
                  <span className="text-sm font-medium">{pmConfig.label}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Ops Status</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${opsConfig.bgColor} ${opsConfig.textColor}`}>
                  <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
                  <span className="text-sm font-medium">{opsConfig.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deliverables Table */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Monthly Deliverables</h2>
              <Badge variant="outline" className="ml-auto">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Badge>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Deliverable</TableHead>
                    <TableHead className="w-[20%]">Due Date</TableHead>
                    <TableHead className="w-[40%]">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.monthlyDeliverables.map((deliverable) => (
                    <TableRow key={deliverable.id}>
                      <TableCell className="font-medium">{deliverable.task}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(deliverable.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{deliverable.comments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Year Record Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Year Record</span>
              </div>
              <p className="text-sm text-amber-700">
                This project maintains a complete record for the entire year, updated by the operations team and project managers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;