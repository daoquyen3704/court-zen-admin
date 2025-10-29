import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface AddressSearchProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
}

export default function AddressSearch({
  onSelect,
  placeholder = "Nhập địa chỉ trong Hà Nội (VD: Cầu Giấy, Hoàn Kiếm...)",
}: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      try {
        // 📍 Giới hạn khu vực Hà Nội
        // Tây: 105.5 | Đông: 106.1 | Bắc: 21.3 | Nam: 20.7
        const viewbox = "105.5,21.3,106.1,20.7";
        const searchText = query.toLowerCase().includes("hà nội")
          ? query
          : `${query}, Hà Nội`;

        const params = new URLSearchParams({
          q: searchText,
          format: "json",
          addressdetails: "1",
          limit: "5",
          bounded: "1",
          viewbox,
          "accept-language": "vi",
        });

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const res = await fetch(url, {
          signal: abortRef.current.signal,
          headers: { Referer: window.location.origin },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Lọc lại: chỉ lấy trong VN và có city hoặc suburb
        const filtered = data.filter(
          (item: any) =>
            item.display_name?.includes("Hà Nội") ||
            item.address?.city === "Hà Nội" ||
            item.address?.state === "Hà Nội"
        );

        setResults(filtered);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Lỗi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name;
    setQuery(address);
    setResults([]);
    onSelect(lat, lng, address);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <div className="absolute left-0 right-0 bg-white text-sm text-center py-2 border border-gray-200 rounded-md shadow-md">
          🔍 Đang tìm kiếm trong Hà Nội...
        </div>
      )}

      {results.length > 0 && !loading && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
