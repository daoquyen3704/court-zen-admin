import { UserLayout } from "@/components/UserLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export default function CourtDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const { data: court, isLoading } = useQuery({
    queryKey: ["court", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courts")
        .select("*, categories(*)")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Vui lòng đăng nhập để đặt sân");
      }

      const start = new Date(`${bookingDate}T${startTime}`);
      const end = new Date(`${bookingDate}T${endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = hours * Number(court?.price_per_hour || 0);

      const { error } = await supabase.from("bookings").insert({
        court_id: id!,
        user_id: user.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: notes || null,
        total_price: totalPrice,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Đặt sân thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn để xác nhận.",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/my-bookings");
    },
    onError: (error: Error) => {
      toast({
        title: "Đặt sân thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để đặt sân",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    bookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!court) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy sân</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/category/${court.categories?.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Court Info */}
          <div className="space-y-6">
            {court.image_url && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={court.image_url}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{court.categories?.icon || "⚽"}</span>
                <span>{court.categories?.name}</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{court.name}</h1>
              {court.description && (
                <p className="text-muted-foreground">{court.description}</p>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {Number(court.price_per_hour).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-muted-foreground">/giờ</span>
            </div>

            {(court.latitude && court.longitude) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>Vị trí: {court.latitude}, {court.longitude}</span>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Đặt sân
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Ngày đặt *</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Giờ bắt đầu *</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Giờ kết thúc *</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-name">Họ tên *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Số điện thoại *</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thông tin thêm..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xác nhận đặt sân
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
