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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import axios from "axios";
import MapPicker from "@/components/MapPicker";
import AddressSearch from "@/components/AddressSearch";

const API_URL = import.meta.env.VITE_API_URL;

const Courts = () => {
  const [courts, setCourts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    price_per_hour: "",
    location: "",
    latitude: "",
    longitude: "",
    address: "",
    is_active: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourts();
    fetchCategories();
  }, []);

  // 🟢 Load danh mục
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(data.data || data);
    } catch {
      toast.error("Lỗi tải danh mục");
    }
  };

  // 🟢 Load danh sách sân
  const fetchCourts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}admin/courts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourts(data.data || data);
    } catch {
      toast.error("Lỗi tải danh sách sân");
    }
  };

  // 🟢 Thêm / Cập nhật sân
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courtData = {
      ...formData,
      price_per_hour: parseFloat(formData.price_per_hour),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}admin/courts/${editingId}`, courtData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Cập nhật sân thành công");
      } else {
        await axios.post(`${API_URL}admin/courts`, courtData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Thêm sân mới thành công");
      }
      fetchCourts();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi lưu thông tin sân");
    }
  };

  // 🟢 Sửa sân
  const handleEdit = (court: any) => {
    setEditingId(court.id);
    setFormData({
      name: court.name,
      category_id: court.category_id?.toString() || "",
      description: court.description || "",
      price_per_hour: court.price_per_hour?.toString() || "",
      location: court.location || "",
      latitude: court.latitude?.toString() || "",
      longitude: court.longitude?.toString() || "",
      address: court.address || "",
      is_active: court.is_active,
    });
    setOpen(true);
  };

  // 🟢 Xóa sân
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sân này?")) return;
    try {
      await axios.delete(`${API_URL}admin/courts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa sân thành công");
      fetchCourts();
    } catch {
      toast.error("Lỗi khi xóa sân");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      description: "",
      price_per_hour: "",
      location: "",
      latitude: "",
      longitude: "",
      address: "",
      is_active: true,
    });
    setEditingId(null);
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
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
                <Plus className="mr-2 h-4 w-4" /> Thêm sân
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Sửa thông tin sân" : "Thêm sân mới"}
                </DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết sân thể thao
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 🏷️ Tên & Danh mục */}
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
                    <Label>Danh mục *</Label>
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
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 📝 Mô tả */}
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {/* 💰 Giá thuê */}
                <div className="space-y-2">
                  <Label>Giá thuê (VNĐ/giờ)</Label>
                  <Input
                    type="number"
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

                {/* 🏙️ Vị trí / Địa chỉ */}
                <div className="space-y-2">
                  <Label>Địa chỉ (OpenStreetMap)</Label>
                  <AddressSearch
                    onSelect={(lat, lng, address) =>
                      setFormData({
                        ...formData,
                        address,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      })
                    }
                  />
                  {formData.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.address}
                    </p>
                  )}
                </div>

                {/* 📍 Nhập tọa độ thủ công */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      placeholder="21.0285"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      placeholder="105.8542"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location (mô tả ngắn)</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="VD: Gần CV Thống Nhất"
                    />
                  </div>
                </div>

                {/* 🗺️ Bản đồ */}
                {(formData.latitude || formData.longitude) && (
                  <div className="space-y-2">
                    <Label>Bản đồ vị trí</Label>
                    <MapPicker
                      latitude={parseFloat(formData.latitude)}
                      longitude={parseFloat(formData.longitude)}
                      onChange={(lat, lng, address) =>
                        setFormData({
                          ...formData,
                          latitude: lat.toString(),
                          longitude: lng.toString(),
                          address: address || formData.address,
                          name: address ? `Sân tại ${address.split(",")[0]}` : formData.name,
                        })
                      }
                    />

                  </div>
                )}

                {/* ✅ Trạng thái */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <Label>Sân đang hoạt động</Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 📋 Danh sách sân */}
        <Card className="border-0 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sân</TableHead>
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
                    <div className="font-medium">{court.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {court.description}
                    </div>
                  </TableCell>
                  <TableCell>{court.category?.name}</TableCell>
                  <TableCell className="font-semibold">
                    {court.price_per_hour?.toLocaleString()} đ
                  </TableCell>
                  <TableCell>
                    {court.latitude && court.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${court.latitude},${court.longitude}`}
                        target="_blank"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4" /> Xem bản đồ
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
