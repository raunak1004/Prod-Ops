import React, { useState, useEffect } from 'react';
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
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { projects, loading, deliverables, refetch } = useProjects();
  const [activeTab, setActiveTab] = useState('project');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [weeklyStatuses, setWeeklyStatuses] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Find project from Supabase data using full UUID
  const currentProject = projects.find(p => p.id === id);
  
  // Fetch weekly statuses for this project
  React.useEffect(() => {
    const fetchWeeklyStatuses = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('weekly_status')
        .select('*')
        .eq('project_id', id)
        .order('week');
      
      if (error) {
        console.error('Error fetching weekly statuses:', error);
      } else {
        setWeeklyStatuses(data || []);
      }
    };
    
    fetchWeeklyStatuses();
  }, [id]);
  
  // Transform to legacy format if found
  const mapStatusToUIStatus = (dbStatus: string): "green" | "amber" | "red" | "not-started" => {
    switch (dbStatus?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'green';
      case 'planning':
      case 'pending':
        return 'amber';
      case 'on-hold':
      case 'cancelled':
        return 'red';
      default:
        return 'not-started';
    }
  };

  const project = currentProject ? {
    id: currentProject.id, // Use full UUID
    name: currentProject.name,
    type: "Projects" as const,
    status: mapStatusToUIStatus(currentProject.status),
    progress: currentProject.progress,
    dueDate: currentProject.end_date || '',
    department: currentProject.manager?.department || 'Unknown',
    lead: currentProject.manager?.full_name || 'Unassigned',
    deliverables: 0,
    completedDeliverables: 0,
    blockers: 0,
    teamSize: 0,
    hoursAllocated: 0,
    hoursUsed: 0,
    lastCallDate: currentProject.created_at.split('T')[0],
    pmStatus: mapStatusToUIStatus(currentProject.status),
    opsStatus: mapStatusToUIStatus(currentProject.status),
    healthTrend: "constant" as const,
    monthlyDeliverables: deliverables
      .filter(d => d.project_id === currentProject.id)
      .map(d => ({
        id: d.id,
        task: d.name,
        dueDate: d.due_date || '',
        comments: d.description || '',
        description: d.description || '',
        type: d.type || 'new-feature',
        assignee: d.assignee_name || 'Unassigned', // Use the new assignee_name field
        department: currentProject.manager?.department || 'Unknown',
        status: mapStatusToUIStatus(d.status || 'pending'),
        flagged: false
      })),
    pastWeeksStatus: weeklyStatuses.map(ws => ({
      week: ws.week,
      status: ws.status as 'green' | 'amber' | 'red' | 'not-started'
    }))
  } : null;

  const handleAddTask = async (taskData: any) => {
    if (!currentProject?.id) return;
    
    try {
      const { error } = await supabase
        .from('deliverables')
        .insert({
          name: taskData.task,
          description: taskData.description,
          type: taskData.type,
          assignee_name: taskData.assignee, // Use the new assignee_name field
          due_date: taskData.dueDate.toISOString().split('T')[0],
          project_id: currentProject.id,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error adding task:', error);
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Task added successfully!"
        });
        refetch(); // Refresh the data
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleBackNavigation = () => {
    navigate('/?tab=projects');
  };

  const handleStatusUpdate = (statusType: 'pmStatus' | 'opsStatus', newStatus: string) => {
    // This would need to update the project status in Supabase
    console.log('Update status:', statusType, newStatus);
  };

  const handleWeeklyStatusAdd = async (weekStatus: { week: string; status: 'red' | 'amber' | 'green' | 'not-started' }) => {
    if (!currentProject?.id) return;
    
    try {
      const { error } = await supabase
        .from('weekly_status')
        .insert({
          project_id: currentProject.id,
          week: weekStatus.week,
          status: weekStatus.status
        });
      
      if (error) {
        console.error('Error adding weekly status:', error);
        toast({
          title: "Error",
          description: "Failed to add weekly status. Please try again.",
          variant: "destructive"
        });
      } else {
        // Update local state
        setWeeklyStatuses(prev => [...prev, {
          project_id: currentProject.id,
          week: weekStatus.week,
          status: weekStatus.status
        }]);
        toast({
          title: "Success",
          description: "Weekly status added successfully!"
        });
      }
    } catch (error) {
      console.error('Error adding weekly status:', error);
    }
  };
  
  const handleWeeklyStatusUpdate = async (week: string, newStatus: 'red' | 'amber' | 'green' | 'not-started') => {
    if (!currentProject?.id) return;
    
    try {
      const { error } = await supabase
        .from('weekly_status')
        .update({ status: newStatus })
        .eq('project_id', currentProject.id)
        .eq('week', week);
      
      if (error) {
        console.error('Error updating weekly status:', error);
        toast({
          title: "Error",
          description: "Failed to update weekly status. Please try again.",
          variant: "destructive"
        });
      } else {
        // Update local state
        setWeeklyStatuses(prev => prev.map(ws => 
          ws.week === week && ws.project_id === currentProject.id
            ? { ...ws, status: newStatus }
            : ws
        ));
        toast({
          title: "Success",
          description: "Weekly status updated successfully!"
        });
      }
    } catch (error) {
      console.error('Error updating weekly status:', error);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: 'red' | 'amber' | 'green' | 'not-started' | 'de-committed' | 'done') => {
    try {
      const { error } = await supabase
        .from('deliverables')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task status:', error);
        toast({
          title: "Error",
          description: "Failed to update task status. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Task status updated successfully!"
        });
        refetch(); // Refresh the data
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleLeadUpdate = (newLead: string) => {
    // This would need to update the project manager in Supabase
    console.log('Update lead:', newLead);
  };

  const handleLastCallDateUpdate = (date: Date) => {
    // This would need to update the project in Supabase
    console.log('Update last call date:', date);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading project details...</div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
            <Button onClick={handleBackNavigation} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects and Products 
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
            Back to Projects and Products 
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