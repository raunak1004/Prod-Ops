import { BarChart3, Users, AlertTriangle, Home } from "lucide-react";
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

const items = [
  { title: "Overview", value: "overview", icon: Home },
  { title: "Projects", value: "projects", icon: BarChart3 },
  { title: "Resources", value: "resources", icon: Users },
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
        <SidebarGroup>
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