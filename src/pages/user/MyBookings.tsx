import { UserLayout } from "@/components/UserLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });
  }, [navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name, categories(name, icon))")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      canceled: "destructive",
      completed: "outline",
    };

    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      canceled: "Đã hủy",
      completed: "Hoàn thành",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Lịch đặt của tôi</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {booking.courts?.categories?.icon || "⚽"}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold">{booking.courts?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.courts?.categories?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.booking_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        Ghi chú: {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(booking.status)}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Number(booking.total_price).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.customer_name} - {booking.customer_phone}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {bookings?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Bạn chưa có lịch đặt nào.
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
