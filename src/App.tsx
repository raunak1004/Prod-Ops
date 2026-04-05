import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import Resources from "./pages/Resources";
import Seats from "./pages/Seats";
import Escalation from "./pages/Escalation";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <header className="h-12 flex items-center border-b bg-background px-4">
                <SidebarTrigger />
              </header>
              <div className="p-4">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/seats" element={<Seats />} />
                  <Route path="/escalation" element={<Escalation />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
