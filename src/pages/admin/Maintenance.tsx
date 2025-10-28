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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MaintenanceBlock {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  courts: {
    name: string;
    categories: {
      name: string;
      icon: string | null;
    };
  };
}

interface Court {
  id: string;
  name: string;
  categories: {
    name: string;
    icon: string | null;
  };
}

const Maintenance = () => {
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
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
    const { data, error } = await supabase
      .from("courts")
      .select("id, name, categories(name, icon)")
      .eq("is_active", true)
      .order("name");

    if (error) {
      toast.error("Lỗi tải danh sách sân");
    } else {
      setCourts(data || []);
    }
  };

  const fetchBlocks = async () => {
    const { data, error } = await supabase
      .from("maintenance_blocks")
      .select("*, courts(name, categories(name, icon))")
      .order("block_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      toast.error("Lỗi tải danh sách bảo trì");
    } else {
      setBlocks(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("maintenance_blocks").insert(formData);

    if (error) {
      toast.error("Lỗi thêm lịch bảo trì");
    } else {
      toast.success("Thêm lịch bảo trì thành công");
      fetchBlocks();
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa lịch bảo trì này?")) return;

    const { error } = await supabase
      .from("maintenance_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Lỗi xóa lịch bảo trì");
    } else {
      toast.success("Xóa lịch bảo trì thành công");
      fetchBlocks();
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
                        <SelectItem key={court.id} value={court.id}>
                          {court.categories.icon} {court.name} -{" "}
                          {court.categories.name}
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
                    placeholder="Vd: Sửa chữa lưới, bảo trì mặt sân..."
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
                        <div className="font-medium">{block.courts.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {block.courts.categories.icon}{" "}
                          {block.courts.categories.name}
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
