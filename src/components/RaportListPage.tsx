import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Trash2, BookOpen } from "lucide-react";

export const RaportListPage: React.FC = () => {
  const [raports, setRaports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 8;

  const fetchRaports = async () => {
    setLoading(true);
    try {
      let query = supabase.from("raport").select("*", { count: "exact" });

      if (search) {
        query = query.ilike("nama", `%${search}%`);
      }
      if (kelasFilter) {
        query = query.eq("kelas", kelasFilter);
      }

      const { data, count, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRaports(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Error fetching raports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin mau hapus raport ini?")) return;
    await supabase.from("raport").delete().eq("id", id);
    fetchRaports();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ Hapus semua raport?")) return;
    await supabase.from("raport").delete().not("id", "is", null);
    fetchRaports();
  };

  const handleDeleteByClass = async () => {
    if (!kelasFilter) {
      alert("Pilih kelas dulu untuk hapus per kelas!");
      return;
    }
    if (!window.confirm(`Hapus semua raport kelas ${kelasFilter}?`)) return;
    await supabase.from("raport").delete().eq("kelas", kelasFilter);
    fetchRaports();
  };

  useEffect(() => {
    fetchRaports();
  }, [page, kelasFilter, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Daftar Raport Santri</span>
          </h1>
          
          <div className="flex flex-row flex-wrap gap-2">
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white
                        px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm 
                        rounded border border-red-600 shadow-sm
                        w-auto transition"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Hapus Semua</span>
            </button>

            <button
              onClick={handleDeleteByClass}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white
                        px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm 
                        rounded border border-orange-600 shadow-sm
                        w-auto transition"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Hapus Per Kelas</span>
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 mt-4 md:mt-6">
          <input
            type="text"
            placeholder="🔍 Cari nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm w-full md:w-1/3"
          />
          <select
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm w-full md:w-1/4"
          >
            <option value="">-- Semua Kelas --</option>
            <option value="7A">7A</option>
            <option value="7B">7B</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10A">10A</option>
            <option value="10B">10B</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>

        {/* Summary */}
        <div className="mb-4 text-gray-700 font-medium">
          {kelasFilter
            ? `Jumlah santri di kelas ${kelasFilter}: ${total}`
            : `Jumlah keseluruhan santri: ${total}`}
        </div>

        {/* Grid Card */}
        {loading ? (
          <p className="text-center py-10">⏳ Memuat data...</p>
        ) : raports.length === 0 ? (
          <p className="text-center py-10 text-gray-500">❌ Tidak ada data raport</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raports.map((r) => (
              <div
                key={r.id}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {r.nama}
                  </h2>
                  <p className="text-sm text-gray-600">Kelas: {r.kelas}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload: {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <a
                    href={r.file_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    Lihat
                  </a>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded-lg shadow-sm disabled:opacity-50"
            >
              ◀ Prev
            </button>
            <span className="px-4 py-2">
              Hal {page} dari {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded-lg shadow-sm disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
