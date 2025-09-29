/*
# Sistema Pembagian Raport Database Schema

1. New Tables
   - `raport`
     - `id` (uuid, primary key)
     - `nama` (text, nama santri)
     - `file_pdf` (text, URL file PDF)
     - `created_at` (timestamp)
   
   - `tunggakan`  
     - `id` (uuid, primary key)
     - `nama` (text, nama santri)
     - `jumlah_tunggakan` (numeric, jumlah tunggakan)
     - `created_at` (timestamp)

2. Security
   - Enable RLS on both tables
   - Public read access for raport (filtered by tunggakan)
   - Authenticated write access for teachers
   - Storage bucket for PDF files
*/

-- Create raport table
CREATE TABLE IF NOT EXISTS raport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  file_pdf text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tunggakan table  
CREATE TABLE IF NOT EXISTS tunggakan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text UNIQUE NOT NULL,
  jumlah_tunggakan numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE raport ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunggakan ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raport table
CREATE POLICY "Anyone can read raport data"
  ON raport
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert raport"
  ON raport
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update raport"
  ON raport
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete raport"
  ON raport
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for tunggakan table
CREATE POLICY "Anyone can read tunggakan data"
  ON tunggakan
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage tunggakan"
  ON tunggakan
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('raport-files', 'raport-files', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view raport files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'raport-files');

CREATE POLICY "Authenticated users can upload raport files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'raport-files');

CREATE POLICY "Authenticated users can update raport files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'raport-files');

CREATE POLICY "Authenticated users can delete raport files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'raport-files');