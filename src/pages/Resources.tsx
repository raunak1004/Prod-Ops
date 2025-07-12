import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceOverview } from "@/components/ResourceOverview";
import { EmployeesList } from "@/components/EmployeesList";
import { ResourceUtilization } from "@/components/ResourceUtilization";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { projectsAndProducts } from "@/data/projectsData";

const Resources = () => {
  const [projectsData] = useState(projectsAndProducts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-600 mt-1">Monitor and optimize resource allocation across projects</p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <ResourceOverview projects={projectsData} />
          </TabsContent>
          
          <TabsContent value="employees" className="mt-6">
            <EmployeesList />
          </TabsContent>
          
          <TabsContent value="allocation" className="mt-6">
            <ResourceAllocation />
          </TabsContent>
          
          <TabsContent value="utilization" className="mt-6">
            <ResourceUtilization projects={projectsData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;