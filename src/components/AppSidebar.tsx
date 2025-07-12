import { BarChart3, Users, AlertTriangle, Home, MapPin, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const items = [
  { title: "Overview", path: "/", icon: Home },
  { title: "Projects and Products", path: "/projects", icon: BarChart3 },
  { title: "Resources", path: "/resources", icon: Users },
  { title: "Seat Allocation", path: "/seats", icon: MapPin },
  { title: "Escalation", path: "/escalation", icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Company Logo Section */}
        <div className="p-4">
          <img 
            src="/lovable-uploads/10c57d8d-b201-4254-b1bc-9fbb0c27e564.png" 
            alt="Foxsense Innovations" 
            className={state === "collapsed" ? "h-8 w-8 object-contain mx-auto" : "w-full h-auto max-h-12 object-contain"}
          />
        </div>
        
        <Separator className="mx-4" />
        
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={currentPath === item.path}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}