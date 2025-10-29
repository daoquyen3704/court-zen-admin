import { UserLayout } from "@/components/UserLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";

export default function CategoryCourts() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: courts, isLoading } = useQuery({
    queryKey: ["courts", category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{category?.icon || "⚽"}</span>
            <h1 className="text-4xl font-bold">{category?.name}</h1>
          </div>
          {category?.description && (
            <p className="text-muted-foreground text-lg">{category.description}</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts?.map((court) => (
              <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {court.image_url && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={court.image_url}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{court.name}</h3>
                    {court.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {court.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {Number(court.price_per_hour).toLocaleString('vi-VN')}đ<span className="text-sm text-muted-foreground">/giờ</span>
                    </div>
                  </div>

                  {(court.latitude && court.longitude) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Xem trên bản đồ</span>
                    </div>
                  )}

                  <Button className="w-full" asChild>
                    <Link to={`/court/${court.id}`}>
                      Đặt sân ngay
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && courts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Hiện chưa có sân nào trong danh mục này.
          </div>
        )}
      </div>
    </UserLayout>
  );
}
