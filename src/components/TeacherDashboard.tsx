import React, { useState, useEffect } from 'react';
import { Upload, Users, DollarSign, FileText, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { getTunggakan, addTunggakan, deleteTunggakan, processZipUpload, type TunggakanData } from '../services/raportService';

export function TeacherDashboard() {
  const [tunggakanList, setTunggakanList] = useState<TunggakanData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newTunggakan, setNewTunggakan] = useState({ nama: '', jumlah: 0, kelas: '' });
  const [loading, setLoading] = useState(false);
  const [kelasRaport, setKelasRaport] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelas, setFilterKelas] = useState("");


  useEffect(() => {
    loadTunggakan();
  }, []);

  const loadTunggakan = async () => {
    try {
      const data = await getTunggakan();
      setTunggakanList(data);
    } catch (error) {
      console.error('Error loading tunggakan:', error);
    }
  };

  const filteredTunggakan = tunggakanList.filter((t) => {
    const matchNama = t.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = filterKelas ? t.kelas === filterKelas : true;
    return matchNama && matchKelas;
  });


  // --- Upload Raport ZIP ---
  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!kelasRaport) {
      setUploadMessage({
        type: 'error',
        message: 'Silakan pilih kelas terlebih dahulu sebelum upload ZIP!'
      });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const result = await processZipUpload(file, kelasRaport); // ✅ kirim kelasRaport

      if (result.success > 0 && result.errors.length === 0) {
        setUploadMessage({
          type: 'success',
          message: `Berhasil memproses ${result.success} file raport untuk kelas ${kelasRaport}!`
        });
      } else if (result.success > 0 && result.errors.length > 0) {
        setUploadMessage({
          type: 'error',
          message: `Berhasil: ${result.success}, Error: ${result.errors.join(', ')}`
        });
      } else {
        setUploadMessage({
          type: 'error',
          message: `Gagal memproses file: ${result.errors.join(', ')}`
        });
      }
    } catch (error) {
      setUploadMessage({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // --- Tambah Tunggakan ---
  const handleAddTunggakan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTunggakan.nama.trim() || newTunggakan.jumlah <= 0 || !newTunggakan.kelas) return;

    setLoading(true);
    try {
      await addTunggakan(newTunggakan.nama.trim(), newTunggakan.jumlah, newTunggakan.kelas); // ✅ kirim kelas
      setNewTunggakan({ nama: '', jumlah: 0, kelas: '' });
      await loadTunggakan();
      setUploadMessage({
        type: 'success',
        message: 'Data tunggakan berhasil ditambahkan!'
      });
    } catch (error) {
      setUploadMessage({
        type: 'error',
        message: `Gagal menambahkan tunggakan: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTunggakan = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data tunggakan ini?')) return;

    try {
      await deleteTunggakan(id);
      await loadTunggakan();
      setUploadMessage({
        type: 'success',
        message: 'Data tunggakan berhasil dihapus!'
      });
    } catch (error) {
      setUploadMessage({
        type: 'error',
        message: `Gagal menghapus tunggakan: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Guru</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola upload raport dan data tunggakan santri</p>
      </div>

      {uploadMessage && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start ${
          uploadMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {uploadMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          )}
          <span className={`text-sm sm:text-base ${uploadMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {uploadMessage.message}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-4 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mr-3 sm:mr-4">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload Raport</h2>
              <p className="text-gray-600 text-xs sm:text-sm">Upload file ZIP berisi raport santri</p>
            </div>
          </div>

          {/* Dropdown Pilih Kelas */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Pilih Kelas
            </label>
            <select
              value={kelasRaport}
              onChange={(e) => setKelasRaport(e.target.value)}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">-- Pilih Kelas --</option>
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

          {/* Upload ZIP */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-green-400 transition-colors">
            <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
              Pilih file ZIP yang berisi raport santri dalam format PDF
            </p>
            <input
              type="file"
              accept=".zip,.rar"
              onChange={handleZipUpload}
              disabled={uploading}
              className="hidden"
              id="zip-upload"
            />
            <label
              htmlFor="zip-upload"
              className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 cursor-pointer transition-all font-medium shadow-sm text-sm sm:text-base ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Pilih File ZIP
                </>
              )}
            </label>
          </div>
        </div>

        {/* Add Tunggakan Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-4 sm:p-8">
          <div className="flex items-center mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mr-3 sm:mr-4">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Tambah Tunggakan</h2>
              <p className="text-gray-600 text-xs sm:text-sm">Masukkan data tunggakan santri</p>
            </div>
          </div>

          <form onSubmit={handleAddTunggakan} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Nama Santri
              </label>
              <input
                type="text"
                required
                value={newTunggakan.nama}
                onChange={(e) => setNewTunggakan({ ...newTunggakan, nama: e.target.value })}
                placeholder="Masukkan nama santri"
                className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Jumlah Tunggakan (Rp)
              </label>
              <input
                type="number"
                required
                min="1"
                value={newTunggakan.jumlah || ''}
                onChange={(e) => setNewTunggakan({ ...newTunggakan, jumlah: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              />
            </div>

            {/* Dropdown kelas untuk tunggakan */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Kelas
              </label>
              <select
                required
                value={newTunggakan.kelas}
                onChange={(e) => setNewTunggakan({ ...newTunggakan, kelas: e.target.value })}
                className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              >
                <option value="">-- Pilih Kelas --</option>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-all font-medium shadow-sm text-sm sm:text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Tambah Tunggakan
                </>
              )}
            </button>
          </form>
        </div>
      </div>    

      {/* Daftar Tunggakan */}
      <div className="mt-4 sm:mt-8 bg-white rounded-2xl shadow-xl border border-green-100 p-4 sm:p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg mr-3 sm:mr-4">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Daftar Tunggakan</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Santri dengan tunggakan tidak akan muncul di pencarian publik</p>
          </div>
        </div>

        {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            {/* Input Search */}
            <input
              type="text"
              placeholder="Cari nama santri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />

            {/* Dropdown Filter Kelas */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="">Semua Kelas</option>
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

        {tunggakanList.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Santri
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    kelas
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Tunggakan
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Tanggal
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTunggakan.map((tunggakan) => (
                  <tr key={tunggakan.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 break-words">{tunggakan.nama}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 break-words">{tunggakan.kelas}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-semibold">
                        {formatCurrency(tunggakan.jumlah_tunggakan)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-500">
                        {new Date(tunggakan.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteTunggakan(tunggakan.id)}
                        className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Belum ada tunggakan</h3>
            <p className="text-sm sm:text-base text-gray-600">Semua santri dapat mengakses raportnya</p>
          </div>
        )}
      </div>
    </div>
  );
}
