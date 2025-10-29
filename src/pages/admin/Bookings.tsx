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
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:8000/api/

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Nếu có filter
      const filtered =
        statusFilter === "all"
          ? data
          : data.filter((b) => b.status === statusFilter);

      setBookings(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách đặt sân");
    }
  };

  const updateBookingStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}admin/bookings/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Cập nhật trạng thái thành công");
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
      confirmed: { label: "Đã xác nhận", variant: "default", icon: CheckCircle },
      canceled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
      completed: { label: "Hoàn thành", variant: "outline", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
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
                        {booking.court?.category?.icon}
                      </span>
                      <div>
                        <div className="font-medium">{booking.court?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.court?.category?.name}
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
                    {booking.total_price?.toLocaleString()} đ
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
