import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, MapPin, Calendar, Tags } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalCategories: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [courtsRes, categoriesRes, bookingsRes, pendingRes] = await Promise.all([
      supabase.from("courts").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setStats({
      totalCourts: courtsRes.count || 0,
      totalCategories: categoriesRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      pendingBookings: pendingRes.count || 0,
    });
  };

  const statCards = [
    {
      title: "Tổng số sân",
      value: stats.totalCourts,
      icon: MapPin,
      color: "text-primary",
    },
    {
      title: "Danh mục",
      value: stats.totalCategories,
      icon: Tags,
      color: "text-secondary",
    },
    {
      title: "Tổng đặt sân",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "Chờ xác nhận",
      value: stats.pendingBookings,
      icon: LayoutDashboard,
      color: "text-warning",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Tổng quan hệ thống quản lý đặt sân
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
