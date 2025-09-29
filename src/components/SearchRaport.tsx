import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, Users, AlertCircle } from 'lucide-react';
import { searchRaports, type RaportData } from '../services/raportService';

export function SearchRaport() {
  const [query, setQuery] = useState('');
  const [raports, setRaports] = useState<RaportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchRaports(query);
      setRaports(results);
    } catch (err) {
      setError('Gagal memuat data raport. Silakan coba lagi.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (raport: RaportData) => {
    try {
      // Ambil file dari URL Supabase
      const response = await fetch(raport.file_pdf, {
        mode: "cors"
      });
      const blob = await response.blob();

      // Buat link download dari blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = raport.nama_file || "raport.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Bersihkan memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download:", error);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4 sm:mb-6">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
          Cari Raport Santri
        </h1>
        <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Masukkan nama santri untuk mencari dan mengunduh raport. 
          <span className="text-green-600 font-medium"> the Real Report</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="p-4 sm:p-8">
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Masukkan nama santri..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-10 sm:pl-12 pr-16 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg placeholder-gray-400 bg-gray-50 focus:bg-white transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute inset-y-0 right-0 px-3 sm:px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-r-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all font-medium text-sm sm:text-base"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm sm:text-base">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : raports.length > 0 ? (
              <>
                <div className="flex items-center mb-4 sm:mb-6">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Ditemukan {raports.length} raport santri
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {raports.map((raport) => (
                    <div
                      key={raport.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                            {raport.nama}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Diunggah: {formatDate(raport.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(raport)}
                          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : query && !loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 px-4">
                  Raport tidak ditemukan
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                  Tidak ada raport dengan nama "{query}". Coba periksa ejaan atau gunakan nama yang berbeda.
                </p>
                <p className="text-xs sm:text-sm text-green-600 px-4">
                  💡 Tips: Pastikan nama santri ditulis dengan benar dan tidak memiliki tunggakan.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 px-4">
                  Semua Raport Tersedia
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  Menampilkan semua raport yang dapat diunduh. Gunakan pencarian untuk menemukan raport santri tertentu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}