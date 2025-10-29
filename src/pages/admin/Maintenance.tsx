import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:8000/api/

const Maintenance = () => {
  const [blocks, setBlocks] = useState([]);
  const [courts, setCourts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    court_id: "",
    block_date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  useEffect(() => {
    fetchBlocks();
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}admin/courts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourts(data.filter((court) => court.is_active));
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách sân");
    }
  };

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}admin/maintenance-blocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlocks(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách bảo trì");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_URL}admin/maintenance-blocks`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Thêm lịch bảo trì thành công");
      fetchBlocks();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi thêm lịch bảo trì");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa lịch bảo trì này?")) return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}admin/maintenance-blocks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa lịch bảo trì thành công");
      fetchBlocks();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa lịch bảo trì");
    }
  };

  const resetForm = () => {
    setFormData({
      court_id: "",
      block_date: "",
      start_time: "",
      end_time: "",
      reason: "",
    });
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý bảo trì</h1>
            <p className="text-muted-foreground mt-2">
              Block giờ để bảo trì và sửa chữa sân
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm lịch bảo trì
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm lịch bảo trì mới</DialogTitle>
                <DialogDescription>
                  Block thời gian để bảo trì sân
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="court">Chọn sân *</Label>
                  <Select
                    value={formData.court_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, court_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sân cần bảo trì" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id.toString()}>
                          {court.category?.icon} {court.name} -{" "}
                          {court.category?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block_date">Ngày bảo trì *</Label>
                  <Input
                    id="block_date"
                    type="date"
                    value={formData.block_date}
                    onChange={(e) =>
                      setFormData({ ...formData, block_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">Giờ kết thúc *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Lý do bảo trì</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="VD: Sửa lưới, thay cỏ, vệ sinh..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Thêm lịch bảo trì
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
                <TableHead>Ngày bảo trì</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-warning" />
                      <div>
                        <div className="font-medium">
                          {block.court?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {block.court?.category?.icon}{" "}
                          {block.court?.category?.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {format(new Date(block.block_date), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell>
                    {block.start_time} - {block.end_time}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {block.reason || (
                      <span className="text-muted-foreground italic">
                        Không có ghi chú
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(block.id)}
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

export default Maintenance;
