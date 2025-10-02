import { supabase } from '../lib/supabase';
import { formatStudentName, extractZipFile } from '../utils/fileProcessing';

export interface RaportData {
  nama_file: string;
  id: string;
  nama: string;
  kelas: string;
  file_pdf: string;
  created_at: string;
}

export interface TunggakanData {
  id: string;
  nama: string;
  kelas: string;
  jumlah_tunggakan: number;
  created_at: string;
}

// Ambil raport yang tidak ada tunggakan
export async function getAvailableRaports(
  page = 1,
  limit = 10,
  kelasFilter = '',
  searchQuery = ''
): Promise<{ data: RaportData[]; total: number }> {
  // Ambil semua raport
  let query = supabase
    .from('raport')
    .select('*', { count: 'exact' })
    .order('nama', { ascending: true });

  if (kelasFilter) {
    query = query.eq('kelas', kelasFilter);
  }

  if (searchQuery) {
    query = query.ilike('nama', `%${searchQuery}%`);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: raports, error, count } = await query;
  if (error) throw error;

  // Ambil semua data tunggakan
  const { data: tunggakan, error: tunggakanError } = await supabase
    .from('tunggakan')
    .select('nama, kelas');

  if (tunggakanError) throw tunggakanError;

  // Buat set key unik: nama+kelas
  const tunggakanSet = new Set(
    (tunggakan || []).map((t) => `${t.nama.toLowerCase()}|${t.kelas.toLowerCase()}`)
  );

  // Filter raport yang tidak ada tunggakan
  const availableRaports =
    raports?.filter(
      (r) => !tunggakanSet.has(`${r.nama.toLowerCase()}|${r.kelas.toLowerCase()}`)
    ) || [];

  return { data: availableRaports, total: count || 0 };
}

// Cari raport berdasarkan nama, kelas, halaman, dan limit
export async function searchRaports(
  query: string,
  page = 1,
  limit = 10,
  kelasFilter = ''
): Promise<{ data: RaportData[]; total: number }> {
  return getAvailableRaports(page, limit, kelasFilter, query);
}

// Cari tunggakan berdasarkan nama dan kelas
export async function searchTunggakan(nama: string, kelas: string) {
  const { data, error } = await supabase
    .from('tunggakan')
    .select('*')
    .ilike('nama', nama) // case-insensitive
    .eq('kelas', kelas);

  if (error) throw error;
  return { data };
}

// Upload file raport ke storage dan dapatkan URL publiknya
export async function uploadRaportFile(file: File, studentName: string, kelas: string): Promise<string> {
  const filename = `${Date.now()}-${studentName.replace(/\s+/g, '_')}.pdf`;
  const filePath = `raports/${kelas}/${filename}`;

  const { error } = await supabase.storage
    .from('raport-files')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('raport-files')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Simpan data raport ke database
export async function saveRaportToDatabase(nama: string, kelas: string, fileUrl: string): Promise<void> {
  const { error } = await supabase
    .from('raport')
    .insert([{ nama, kelas, file_pdf: fileUrl }]);

  if (error) throw error;
}

// Hapus data raport
export async function deleteRaport(id: string): Promise<void> {
  const { error } = await supabase
    .from('raport')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Ambil data tunggakan
export async function getTunggakan(): Promise<TunggakanData[]> {
  const { data, error } = await supabase
    .from('tunggakan')
    .select('*')
    .order('nama');

  if (error) throw error;
  return data || [];
}

// Tambah data tunggakan
export async function addTunggakan(nama: string, jumlah: number, kelas: string): Promise<void> {
  const { error } = await supabase
    .from('tunggakan')
    .insert([{ nama, jumlah_tunggakan: jumlah, kelas }]);

  if (error) throw error;
}

// Hapus data tunggakan
export async function deleteTunggakan(id: string): Promise<void> {
  const { error } = await supabase
    .from('tunggakan')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Proses upload file ZIP berisi banyak PDF raport
export async function processZipUpload(zipFile: File, kelas: string): Promise<{ success: number; errors: string[] }> {
  const results = { success: 0, errors: [] as string[] };

  try {
    const pdfFiles = await extractZipFile(zipFile);

    for (const pdfFile of pdfFiles) {
      try {
        const studentName = formatStudentName(pdfFile.name);
        const fileUrl = await uploadRaportFile(pdfFile, studentName, kelas);
        await saveRaportToDatabase(studentName, kelas, fileUrl);
        results.success++;
      } catch (error) {
        results.errors.push(
          `Error processing ${pdfFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  } catch (error) {
    results.errors.push(
      `Error extracting ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return results;
}
