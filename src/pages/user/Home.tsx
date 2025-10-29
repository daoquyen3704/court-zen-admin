import { UserLayout } from "@/components/UserLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Đặt sân thể thao dễ dàng
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tìm và đặt sân thể thao yêu thích của bạn chỉ với vài cú click
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Chọn loại sân
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-card border-2 hover:border-primary">
                  <div className="text-center space-y-4">
                    <div className="text-5xl">{category.icon || "⚽"}</div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    {category.description && (
                      <p className="text-muted-foreground text-sm">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && categories?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có danh mục nào. Vui lòng liên hệ quản trị viên.
          </div>
        )}
      </section>
    </UserLayout>
  );
}
