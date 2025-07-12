import { BarChart3, Users, AlertTriangle, Home, MapPin, Building2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  { title: "Overview", value: "overview", icon: Home },
  { title: "Projects and Products", value: "projects", icon: BarChart3 },
  { title: "Resources", value: "resources", icon: Users },
  { title: "Seat Allocation", value: "seats", icon: MapPin },
  { title: "Escalation", value: "escalation", icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    navigate(`/?tab=${value}`);
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Company Icon Section */}
        <div className="p-4 flex justify-center">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        
        <Separator className="mx-4" />
        
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleTabChange(item.value)}
                    isActive={currentTab === item.value}
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