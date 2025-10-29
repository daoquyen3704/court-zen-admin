/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange?: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function MapPicker({
  latitude = 10.762622,
  longitude = 106.660172,
  onChange,
  height = "400px",
}: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const [currentPos, setCurrentPos] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const map = L.map("leaflet-map", {
      center: [latitude, longitude],
      zoom: 13,
    });
    mapRef.current = map;

    // 🗺️ Base layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // 📍 Thêm marker nếu có tọa độ ban đầu
    markerRef.current = L.marker([latitude, longitude], { draggable: true })
      .addTo(map)
      .bindPopup("Vị trí được chọn")
      .openPopup();

    // Khi click chọn vị trí mới
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      await updateMarker(lat, lng);
    });

    // Khi kéo marker
    markerRef.current.on("dragend", async (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      await updateMarker(lat, lng);
    });

    return () => map.remove();
  }, []);

  // 🧭 Lấy địa chỉ từ lat/lng (reverse geocoding)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`
      );
      const data = await res.json();
      return data?.display_name || "Không xác định địa chỉ";
    } catch {
      return "Không xác định địa chỉ";
    }
  };

  // 🗺️ Cập nhật marker và địa chỉ
  const updateMarker = async (lat: number, lng: number) => {
    setCurrentPos([lat, lng]);
    markerRef.current?.setLatLng([lat, lng]);
    mapRef.current?.flyTo([lat, lng], 15);

    const addr = await fetchAddress(lat, lng);
    setAddress(addr);
    markerRef.current?.bindPopup(addr).openPopup();

    onChange && onChange(lat, lng, addr);
  };

  // 📡 Lấy vị trí GPS hiện tại
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("⚠️ Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    toast.loading("Đang xác định vị trí hiện tại...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await updateMarker(lat, lng);

        // Marker GPS
        if (!gpsMarkerRef.current) {
          gpsMarkerRef.current = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
          })
            .addTo(mapRef.current!)
            .bindPopup("📍 Vị trí của bạn")
            .openPopup();
        } else {
          gpsMarkerRef.current.setLatLng([lat, lng]).openPopup();
        }

        toast.success("✅ Đã lấy vị trí hiện tại!");
      },
      (err) => {
        toast.dismiss();
        switch (err.code) {
          case err.PERMISSION_DENIED:
            toast.error("❌ Bạn đã từ chối quyền truy cập GPS.");
            break;
          case err.POSITION_UNAVAILABLE:
            toast.error("⚠️ Không thể xác định vị trí, hãy thử lại.");
            break;
          case err.TIMEOUT:
            toast.error("⏱️ Quá thời gian chờ GPS.");
            break;
          default:
            toast.error("❌ Lỗi không xác định khi lấy vị trí.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      <div
        id="leaflet-map"
        className="w-full rounded-md border shadow"
        style={{ height }}
      ></div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-700 mt-2 gap-1">
        <span>
          📍 <b>{currentPos[0].toFixed(6)}</b>,{" "}
          <b>{currentPos[1].toFixed(6)}</b>
        </span>
        <button
          type="button"
          onClick={handleGPS}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Lấy vị trí hiện tại
        </button>
      </div>

      {address && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          🏠 {address}
        </div>
      )}
    </div>
  );
}
