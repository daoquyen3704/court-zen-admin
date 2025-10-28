import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

interface Court {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_hour: number;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  category_id: string;
  categories: {
    name: string;
    icon: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const Courts = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    price_per_hour: "",
    latitude: "",
    longitude: "",
    is_active: true,
    category_id: "",
  });

  useEffect(() => {
    fetchCourts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, icon")
      .order("name");

    if (error) {
      toast.error("Lỗi tải danh mục");
    } else {
      setCategories(data || []);
    }
  };

  const fetchCourts = async () => {
    const { data, error } = await supabase
      .from("courts")
      .select("*, categories(name, icon)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Lỗi tải danh sách sân");
    } else {
      setCourts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courtData = {
      ...formData,
      price_per_hour: parseFloat(formData.price_per_hour),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("courts")
        .update(courtData)
        .eq("id", editingId);

      if (error) {
        toast.error("Lỗi cập nhật sân");
      } else {
        toast.success("Cập nhật sân thành công");
        fetchCourts();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("courts").insert(courtData);

      if (error) {
        toast.error("Lỗi thêm sân");
      } else {
        toast.success("Thêm sân thành công");
        fetchCourts();
        resetForm();
      }
    }
  };

  const handleEdit = (court: Court) => {
    setEditingId(court.id);
    setFormData({
      name: court.name,
      description: court.description || "",
      image_url: court.image_url || "",
      price_per_hour: court.price_per_hour.toString(),
      latitude: court.latitude?.toString() || "",
      longitude: court.longitude?.toString() || "",
      is_active: court.is_active,
      category_id: court.category_id,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sân này?")) return;

    const { error } = await supabase.from("courts").delete().eq("id", id);

    if (error) {
      toast.error("Lỗi xóa sân");
    } else {
      toast.success("Xóa sân thành công");
      fetchCourts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      price_per_hour: "",
      latitude: "",
      longitude: "",
      is_active: true,
      category_id: "",
    });
    setEditingId(null);
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý sân</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý thông tin chi tiết các sân thể thao
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sân
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Sửa thông tin sân" : "Thêm sân mới"}
                </DialogTitle>
                <DialogDescription>
                  Điền đầy đủ thông tin sân thể thao
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sân *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL hình ảnh</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Giá thuê (VNĐ/giờ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_hour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_hour: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      placeholder="21.028511"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      placeholder="105.804817"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Sân đang hoạt động</Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sân</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá/giờ</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {court.image_url && (
                        <img
                          src={court.image_url}
                          alt={court.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{court.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {court.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg">
                      {court.categories.icon} {court.categories.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {court.price_per_hour.toLocaleString()} đ
                  </TableCell>
                  <TableCell>
                    {court.latitude && court.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${court.latitude},${court.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4" />
                        Xem bản đồ
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={court.is_active ? "default" : "secondary"}>
                      {court.is_active ? "Hoạt động" : "Tạm ngưng"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(court)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(court.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

export default Courts;
