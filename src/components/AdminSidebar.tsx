import { LayoutDashboard, Tags, MapPin, Calendar, Wrench, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Danh mục", url: "/admin/categories", icon: Tags },
  { title: "Quản lý sân", url: "/admin/courts", icon: MapPin },
  { title: "Lịch đặt sân", url: "/admin/bookings", icon: Calendar },
  { title: "Bảo trì", url: "/admin/maintenance", icon: Wrench },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Lỗi đăng xuất");
    } else {
      toast.success("Đăng xuất thành công");
      navigate("/auth");
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            ⚽ SportBooking
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-sidebar-accent"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-destructive hover:text-destructive-foreground w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
