import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceOverview } from "@/components/ResourceOverview";
import ProjectHoursCarousel from "@/components/ProjectHoursCarousel";
import { EmployeesList } from "@/components/EmployeesList";
import { ResourceUtilization } from "@/components/ResourceUtilization";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { useProjects } from "@/hooks/useProjects";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { transformProject } from "@/lib/transforms";

const Resources = () => {
  const { projects, loading, error, deliverables, issues } = useProjects();

  const transformedProjects = useMemo(
    () => projects.map(p => transformProject(p, deliverables, issues)),
    [projects, deliverables, issues]
  );

  if (loading) return <LoadingState message="Loading resources..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && <ErrorBanner message={error} />}

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
            <div className="space-y-6">
              <ProjectHoursCarousel />
              <ResourceOverview projects={transformedProjects} />
            </div>
          </TabsContent>

          <TabsContent value="employees" className="mt-6">
            <EmployeesList />
          </TabsContent>

          <TabsContent value="allocation" className="mt-6">
            <ResourceAllocation />
          </TabsContent>

          <TabsContent value="utilization" className="mt-6">
            <ResourceUtilization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
