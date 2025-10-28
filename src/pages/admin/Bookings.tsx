import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  total_price: number;
  courts: {
    name: string;
    categories: {
      name: string;
      icon: string | null;
    };
  };
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    let query = supabase
      .from("bookings")
      .select("*, courts(name, categories(name, icon))")
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as any);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Lỗi tải danh sách đặt sân");
    } else {
      setBookings(data || []);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus as any })
      .eq("id", id);

    if (error) {
      toast.error("Lỗi cập nhật trạng thái");
    } else {
      toast.success("Cập nhật trạng thái thành công");
      fetchBookings();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Đã xác nhận", variant: "default" as const, icon: CheckCircle },
      canceled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle },
      completed: { label: "Hoàn thành", variant: "outline" as const, icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lịch đặt sân</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và xác nhận các booking
            </p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="canceled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-0 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Sân</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">
                      {format(new Date(booking.booking_date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {booking.courts.categories.icon}
                      </span>
                      <div>
                        <div className="font-medium">{booking.courts.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.courts.categories.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.customer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.customer_phone}
                    </div>
                    {booking.notes && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        {booking.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {booking.total_price.toLocaleString()} đ
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "confirmed")
                            }
                          >
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateBookingStatus(booking.id, "canceled")
                            }
                          >
                            Hủy
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateBookingStatus(booking.id, "completed")
                          }
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Bookings;
