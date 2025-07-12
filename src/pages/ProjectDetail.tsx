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
import { projectsAndProducts, getProjectById, type Project } from '@/data/projectsData';

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
  const [currentProject, setCurrentProject] = useState<Project | null>(() => 
    getProjectById(parseInt(id || '0')) || null
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
    navigate('/?tab=projects');
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

  const handleTaskStatusUpdate = (taskId: number, newStatus: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed' | 'done') => {
    if (!project) return;
    const updatedTasks = project.monthlyDeliverables.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setCurrentProject({
      ...project,
      monthlyDeliverables: updatedTasks
    } as any);
  };

  const handleLeadUpdate = (newLead: string) => {
    if (!project) return;
    setCurrentProject({
      ...project,
      lead: newLead
    } as any);
  };

  const handleLastCallDateUpdate = (date: Date) => {
    if (!project) return;
    setCurrentProject({
      ...project,
      lastCallDate: date.toISOString().split('T')[0]
    });
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
          project={{
            ...project,
            lastCallDate: new Date(project.lastCallDate)
          }} 
          onStatusUpdate={handleStatusUpdate}
          onWeeklyStatusAdd={handleWeeklyStatusAdd}
          onWeeklyStatusUpdate={handleWeeklyStatusUpdate}
          onLeadUpdate={handleLeadUpdate}
          onLastCallDateUpdate={handleLastCallDateUpdate}
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