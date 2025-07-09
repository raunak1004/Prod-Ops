
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, AlertTriangle, Clock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: number;
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
  lastCallDate: string;
  pmStatus: "green" | "amber" | "red";
  opsStatus: "green" | "amber" | "red";
  monthlyDeliverables: Array<{
    id: number;
    task: string;
    dueDate: string;
    comments: string;
  }>;
}

interface ProjectCardProps {
  project: Project;
}

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

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const config = statusConfig[project.status];
  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const initials = project.lead.split(' ').map(n => n[0]).join('');
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };
  
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 ${config.borderColor} border-l-4 cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">{project.name}</CardTitle>
            <Badge variant="outline" className="text-xs">{project.department}</Badge>
          </div>
          <div className={`px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
              <span className="text-xs font-medium">{config.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Last Call Date */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
          <Phone className="w-4 h-4 text-slate-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-700">Last Call</div>
            <div className="text-xs text-slate-500">
              {new Date(project.lastCallDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* PM Status vs Ops Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-700">PM Status</div>
              <div className={`px-2 py-1 rounded-full ${pmConfig.bgColor} ${pmConfig.textColor}`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
                  <span className="text-xs font-medium">{pmConfig.label}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-700">Ops Status</div>
              <div className={`px-2 py-1 rounded-full ${opsConfig.bgColor} ${opsConfig.textColor}`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
                  <span className="text-xs font-medium">{opsConfig.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Lead */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-slate-200">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-slate-600">{project.lead}</div>
          <div className="ml-auto text-xs text-slate-500">Lead</div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">{project.progress}%</div>
            <div className="text-xs text-slate-500">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">{project.completedDeliverables}/{project.deliverables}</div>
            <div className="text-xs text-slate-500">Deliverables</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
