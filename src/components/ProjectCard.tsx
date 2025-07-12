
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, AlertTriangle, Clock, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface Project {
  id: number;
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
  lastCallDate: string;
  pmStatus: "green" | "amber" | "red" | "not-started";
  opsStatus: "green" | "amber" | "red" | "not-started";
  monthlyDeliverables: Array<{
    id: number;
    task: string;
    dueDate: string;
    comments: string;
  }>;
}

interface ProjectCardProps {
  project: Project;
  onStatusUpdate?: (projectId: number, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
}

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "Green",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  amber: {
    color: "bg-amber-500", 
    label: "Amber",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  red: {
    color: "bg-red-500",
    label: "Red", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  "not-started": {
    color: "bg-slate-500",
    label: "Not Started",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200"
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onStatusUpdate, onClick, isSelected }) => {
  const config = statusConfig[project.status];
  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const initials = project.lead.split(' ').map(n => n[0]).join('');
  const navigate = useNavigate();
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      navigate(`/project/${project.id}`);
    }
  };
  
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 ${config.borderColor} border-l-4 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">{project.name}</CardTitle>
            <Badge variant="outline" className="text-xs">{project.department}</Badge>
          </div>
          <Select 
            value={project.status} 
            onValueChange={(newStatus: any) => onStatusUpdate?.(project.id, 'status', newStatus)}
          >
            <SelectTrigger 
              className={`h-7 w-auto text-xs ${config.textColor} ${config.bgColor} border-none hover:bg-opacity-80`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="amber">Amber</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
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
              <Select 
                value={project.pmStatus} 
                onValueChange={(newStatus: any) => onStatusUpdate?.(project.id, 'pmStatus', newStatus)}
              >
                <SelectTrigger 
                  className={`h-6 w-auto text-xs ${pmConfig.textColor} ${pmConfig.bgColor} border-none hover:bg-opacity-80`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-700">Ops Status</div>
              <Select 
                value={project.opsStatus} 
                onValueChange={(newStatus: any) => onStatusUpdate?.(project.id, 'opsStatus', newStatus)}
              >
                <SelectTrigger 
                  className={`h-6 w-auto text-xs ${opsConfig.textColor} ${opsConfig.bgColor} border-none hover:bg-opacity-80`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                </SelectContent>
              </Select>
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
