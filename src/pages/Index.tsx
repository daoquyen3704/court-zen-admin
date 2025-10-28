import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚽ SportBooking
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Hệ thống quản lý đặt sân thể thao hiện đại và chuyên nghiệp
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Đăng nhập Admin
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Quản lý sân dễ dàng</h3>
              <p className="text-muted-foreground">
                Thêm, sửa, xóa thông tin sân với giao diện trực quan
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Lịch đặt thông minh</h3>
              <p className="text-muted-foreground">
                Quản lý lịch đặt sân và xử lý booking tự động
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Shield className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Bảo mật cao</h3>
              <p className="text-muted-foreground">
                Hệ thống xác thực an toàn với Lovable Cloud
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
