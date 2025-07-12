import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import { ProjectNavigation } from '@/components/ProjectNavigation';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MonthlyDeliverables } from '@/components/MonthlyDeliverables';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { ResourceOverview } from '@/components/ResourceOverview';
import { IssuesTracker } from '@/components/IssuesTracker';

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
      { id: 1, task: "UI/UX Design Completion", dueDate: "2024-07-15", comments: "Final review in progress", description: "Complete the final UI/UX design review", type: "new-feature", assignee: "John Doe", department: "Design", status: "green" as const },
      { id: 2, task: "Backend API Integration", dueDate: "2024-07-20", comments: "On track", description: "Integrate backend APIs with frontend", type: "feature-request", assignee: "Jane Smith", department: "Development", status: "green" as const },
      { id: 3, task: "Testing Phase", dueDate: "2024-07-25", comments: "Waiting for development completion", description: "Comprehensive testing of all features", type: "adhoc", assignee: "Mike Johnson", department: "QA", status: "amber" as const }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" as const },
      { week: "Week-2", status: "green" as const },
      { week: "Week-3", status: "amber" as const },
      { week: "Week-4", status: "green" as const }
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
      { id: 1, task: "Database Schema Migration", dueDate: "2024-07-12", comments: "Delayed due to complexity", description: "Migrate database schema to new version", type: "bug", assignee: "Alex Chen", department: "Development", status: "red" as const },
      { id: 2, task: "Third-party API Testing", dueDate: "2024-07-18", comments: "Dependencies blocking progress", description: "Test integration with third-party APIs", type: "feature-request", assignee: "Sarah Wilson", department: "QA", status: "amber" as const },
      { id: 3, task: "Security Audit", dueDate: "2024-07-22", comments: "Scheduled for next week", description: "Comprehensive security audit", type: "adhoc", assignee: "David Kim", department: "PM", status: "green" as const }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "amber" as const },
      { week: "Week-2", status: "red" as const },
      { week: "Week-3", status: "red" as const },
      { week: "Week-4", status: "amber" as const }
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
      { id: 1, task: "Data Pipeline Setup", dueDate: "2024-07-14", comments: "Major technical challenges", description: "Set up data pipeline infrastructure", type: "new-feature", assignee: "Emily Rodriguez", department: "Development", status: "red" as const },
      { id: 2, task: "Report Generation Module", dueDate: "2024-07-21", comments: "Waiting for data pipeline", description: "Develop report generation functionality", type: "feature-request", assignee: "Tom Brown", department: "Development", status: "red" as const },
      { id: 3, task: "User Interface Development", dueDate: "2024-07-28", comments: "Resource constraints", description: "Build user interface components", type: "new-feature", assignee: "Lisa Chen", department: "Design", status: "amber" as const }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "red" as const },
      { week: "Week-2", status: "red" as const },
      { week: "Week-3", status: "red" as const },
      { week: "Week-4", status: "red" as const }
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
      { id: 1, task: "Security Policy Updates", dueDate: "2024-07-16", comments: "Nearly complete", description: "Update security policies and procedures", type: "adhoc", assignee: "David Park", department: "PM", status: "green" as const },
      { id: 2, task: "Vulnerability Assessment", dueDate: "2024-07-19", comments: "Scheduled for this week", description: "Conduct vulnerability assessment", type: "adhoc", assignee: "Security Team", department: "QA", status: "green" as const },
      { id: 3, task: "Compliance Documentation", dueDate: "2024-07-24", comments: "Ready for review", description: "Prepare compliance documentation", type: "feature-request", assignee: "Compliance Team", department: "PM", status: "green" as const }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" as const },
      { week: "Week-2", status: "green" as const },
      { week: "Week-3", status: "green" as const },
      { week: "Week-4", status: "green" as const }
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
      { id: 1, task: "Email Campaign Builder", dueDate: "2024-07-17", comments: "Feature complete, testing needed", description: "Build email campaign creation tool", type: "new-feature", assignee: "Jessica Wu", department: "Development", status: "amber" as const },
      { id: 2, task: "Analytics Dashboard", dueDate: "2024-07-23", comments: "UI development in progress", description: "Create analytics dashboard", type: "feature-request", assignee: "Marketing Team", department: "Design", status: "amber" as const },
      { id: 3, task: "Integration Testing", dueDate: "2024-07-26", comments: "Planned after feature completion", description: "Test system integrations", type: "adhoc", assignee: "QA Team", department: "QA", status: "green" as const }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" as const },
      { week: "Week-2", status: "amber" as const },
      { week: "Week-3", status: "amber" as const },
      { week: "Week-4", status: "amber" as const }
    ]
  }
];

// Navigation tabs configuration
const getNavigationTabs = (projectData: any) => [
  { 
    id: 'overview', 
    label: 'Overview', 
    count: 1 
  },
  { 
    id: 'project', 
    label: 'Project', 
    count: projectData?.monthlyDeliverables?.length || 0 
  },
  { 
    id: 'resource', 
    label: 'Resource', 
    count: projectData?.teamSize || 0 
  },
  { 
    id: 'escalation', 
    label: 'Escalation', 
    count: projectData?.blockers || 0 
  }
];

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('project');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(() => 
    mockProjects.find(p => p.id === parseInt(id || '0'))
  );
  
  const project = currentProject;

  const handleAddTask = (taskData: any) => {
    if (!project) return;
    
    const newTask = {
      id: project.monthlyDeliverables.length + 1,
      task: taskData.task,
      dueDate: taskData.dueDate.toISOString().split('T')[0],
      comments: taskData.comments || "",
      description: taskData.description,
      type: taskData.type,
      assignee: taskData.assignee,
      department: taskData.department,
      status: 'green' as const,
      flagged: false
    };
    
    const updatedProject = {
      ...project,
      monthlyDeliverables: [...project.monthlyDeliverables, newTask]
    };
    
    setCurrentProject(updatedProject as any);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleBackNavigation = () => {
    const previousSection = location.state?.from || '/';
    navigate(previousSection);
  };

  const handleStatusUpdate = (statusType: 'pmStatus' | 'opsStatus', newStatus: string) => {
    if (!project) return;
    setCurrentProject({
      ...project,
      [statusType]: newStatus
    } as any);
  };

  const handleWeeklyStatusAdd = (weekStatus: { week: string; status: 'red' | 'amber' | 'green' | 'not-started' }) => {
    if (!project) return;
    setCurrentProject({
      ...project,
      pastWeeksStatus: [...project.pastWeeksStatus, weekStatus]
    } as any);
  };

  const handleWeeklyStatusUpdate = (week: string, newStatus: 'red' | 'amber' | 'green' | 'not-started') => {
    if (!project) return;
    const updatedWeeklyStatus = project.pastWeeksStatus.map(weekData => 
      weekData.week === week ? { ...weekData, status: newStatus } : weekData
    );
    setCurrentProject({
      ...project,
      pastWeeksStatus: updatedWeeklyStatus
    } as any);
  };

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed') => {
    if (!project) return;
    const updatedTasks = project.monthlyDeliverables.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setCurrentProject({
      ...project,
      monthlyDeliverables: updatedTasks
    } as any);
  };
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
            <Button onClick={handleBackNavigation} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navigationTabs = getNavigationTabs(project);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ExecutiveSummary projects={[project]} />;
      case 'project':
        return (
          <MonthlyDeliverables
            tasks={project.monthlyDeliverables}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
            onTaskStatusUpdate={handleTaskStatusUpdate}
            selectedTask={selectedTask}
            isTaskDetailOpen={isTaskDetailOpen}
            setIsTaskDetailOpen={setIsTaskDetailOpen}
          />
        );
      case 'resource':
        return <ResourceOverview projects={[project]} />;
      case 'escalation':
        return <IssuesTracker projects={[project]} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <Button onClick={handleBackNavigation} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Project Header */}
        <div className="px-6 py-4">
        <ProjectHeader 
          project={project} 
          onStatusUpdate={handleStatusUpdate}
          onWeeklyStatusAdd={handleWeeklyStatusAdd}
          onWeeklyStatusUpdate={handleWeeklyStatusUpdate}
        />
        </div>

        {/* Navigation */}
        <ProjectNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={navigationTabs}
        />

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* Year Record Note */}
        <div className="p-6 pt-0">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
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
  );
};

export default ProjectDetail;