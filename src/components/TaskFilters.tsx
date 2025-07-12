import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { X, ChevronDown, Filter } from "lucide-react";

interface Filters {
  status: string;
  type: string;
  assignee: string;
  department: string;
}

interface TaskFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ status: 'all', type: 'all', assignee: '', department: 'all' });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key === 'assignee' ? value !== '' : value !== 'all'
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'green': return 'Green';
      case 'amber': return 'Amber';
      case 'red': return 'Red';
      default: return 'All Statuses';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature-request': return 'Feature Request';
      case 'new-feature': return 'New Feature';
      case 'adhoc': return 'Adhoc';
      case 'bug': return 'Bug';
      default: return 'All Types';
    }
  };

  const getDepartmentLabel = (department: string) => {
    switch (department) {
      case 'Design': return 'Design';
      case 'Development': return 'Development';
      case 'QA': return 'QA';
      case 'PM': return 'PM';
      default: return 'All Departments';
    }
  };

  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-700">Filter Tasks</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              Status: {getStatusLabel(filters.status)}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateFilter('status', 'all')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateFilter('status', 'green')}>
              Green
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('status', 'amber')}>
              Amber
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('status', 'red')}>
              Red
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              Type: {getTypeLabel(filters.type)}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateFilter('type', 'all')}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateFilter('type', 'feature-request')}>
              Feature Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('type', 'new-feature')}>
              New Feature
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('type', 'adhoc')}>
              Adhoc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('type', 'bug')}>
              Bug
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Department Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              Department: {getDepartmentLabel(filters.department)}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateFilter('department', 'all')}>
              All Departments
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateFilter('department', 'Design')}>
              Design
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('department', 'Development')}>
              Development
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('department', 'QA')}>
              QA
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('department', 'PM')}>
              PM
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Assignee:</span>
          <Input
            placeholder="Search assignee..."
            value={filters.assignee}
            onChange={(e) => updateFilter('assignee', e.target.value)}
            className="h-8 w-48"
          />
        </div>
      </div>
    </div>
  );
};