import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

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

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-xs font-medium text-slate-600">
              Status
            </Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger id="status-filter" className="h-8">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="green">On Track</SelectItem>
                <SelectItem value="amber">At Risk</SelectItem>
                <SelectItem value="red">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-xs font-medium text-slate-600">
              Type
            </Label>
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger id="type-filter" className="h-8">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="feature-request">Feature Request</SelectItem>
                <SelectItem value="new-feature">New Feature</SelectItem>
                <SelectItem value="adhoc">Adhoc</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-filter" className="text-xs font-medium text-slate-600">
              Department
            </Label>
            <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
              <SelectTrigger id="department-filter" className="h-8">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee-filter" className="text-xs font-medium text-slate-600">
              Assignee
            </Label>
            <Input
              id="assignee-filter"
              placeholder="Search assignee..."
              value={filters.assignee}
              onChange={(e) => updateFilter('assignee', e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};