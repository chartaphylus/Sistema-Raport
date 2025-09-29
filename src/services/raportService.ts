import { supabase } from '../lib/supabase';
import { formatStudentName, extractZipFile } from '../utils/fileProcessing';

export interface RaportData {
  id: string;
  nama: string;
  file_pdf: string;
  created_at: string;
}

export interface TunggakanData {
  id: string;
  nama: string;
  jumlah_tunggakan: number;
  created_at: string;
}

export async function getAvailableRaports(): Promise<RaportData[]> {
  // Get all raports
  const { data: raports, error: raportError } = await supabase
    .from('raport')
    .select('*')
    .order('nama');

  if (raportError) throw raportError;

  // Get all students with tunggakan
  const { data: tunggakan, error: tunggakanError } = await supabase
    .from('tunggakan')
    .select('nama');

  if (tunggakanError) throw tunggakanError;

  // Filter out students with tunggakan
  const studentsWithTunggakan = new Set(tunggakan?.map(t => t.nama.toLowerCase()) || []);
  
  const availableRaports = raports?.filter(raport => 
    !studentsWithTunggakan.has(raport.nama.toLowerCase())
  ) || [];

  return availableRaports;
}

export async function searchRaports(query: string): Promise<RaportData[]> {
  const raports = await getAvailableRaports();
  
  if (!query.trim()) return raports;
  
  const searchTerm = query.toLowerCase().trim();
  return raports.filter(raport => 
    raport.nama.toLowerCase().includes(searchTerm)
  );
}

export async function uploadRaportFile(file: File, studentName: string): Promise<string> {
  const filename = `${Date.now()}-${studentName.replace(/\s+/g, '_')}.pdf`;
  const filePath = `raports/${filename}`;

  const { data, error } = await supabase.storage
    .from('raport-files')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('raport-files')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function saveRaportToDatabase(nama: string, fileUrl: string): Promise<void> {
  const { error } = await supabase
    .from('raport')
    .insert([
      {
        nama,
        file_pdf: fileUrl,
      },
    ]);

  if (error) throw error;
}

export async function getTunggakan(): Promise<TunggakanData[]> {
  const { data, error } = await supabase
    .from('tunggakan')
    .select('*')
    .order('nama');

  if (error) throw error;
  return data || [];
}

export async function addTunggakan(nama: string, jumlah: number): Promise<void> {
  const { error } = await supabase
    .from('tunggakan')
    .insert([
      {
        nama,
        jumlah_tunggakan: jumlah,
      },
    ]);

  if (error) throw error;
}

export async function deleteTunggakan(id: string): Promise<void> {
  const { error } = await supabase
    .from('tunggakan')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function processZipUpload(zipFile: File): Promise<{ success: number; errors: string[] }> {
  const results = { success: 0, errors: [] as string[] };

  try {
    // Extract PDF files from ZIP
    const pdfFiles = await extractZipFile(zipFile);
    
    // Process each PDF file
    for (const pdfFile of pdfFiles) {
      try {
        const studentName = formatStudentName(pdfFile.name);
        const fileUrl = await uploadRaportFile(pdfFile, studentName);
        await saveRaportToDatabase(studentName, fileUrl);
        results.success++;
      } catch (error) {
        results.errors.push(`Error processing ${pdfFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    results.errors.push(`Error extracting ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return results;
}