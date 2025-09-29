export function formatStudentName(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Replace underscores and dashes with spaces
  const formattedName = nameWithoutExt
    .replace(/[_-]/g, ' ')
    .trim()
    // Capitalize first letter of each word
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return formattedName;
}

export async function extractZipFile(file: File): Promise<File[]> {
  const JSZip = (await import('jszip')).default;
  
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      reject(new Error('File must be a ZIP archive'));
      return;
    }

    const zip = new JSZip();
    
    zip.loadAsync(file).then((zipContent) => {
      const pdfFiles: Promise<File>[] = [];
      
      zipContent.forEach((relativePath, zipEntry) => {
        // Only process PDF files (check both file extension and not a directory)
        const fileName = zipEntry.name.toLowerCase();
        const isPDF = fileName.endsWith('.pdf');
        const isNotDirectory = !zipEntry.dir;
        const isNotMacOSFile = !fileName.includes('__macosx') && !fileName.startsWith('.');
        
        if (isPDF && isNotDirectory && isNotMacOSFile) {
          // Extract just the filename without path for cleaner names
          const cleanFileName = zipEntry.name.split('/').pop() || zipEntry.name;
          
          const pdfPromise = zipEntry.async('blob').then((blob) => {
            return new File([blob], cleanFileName, { type: 'application/pdf' });
          });
          pdfFiles.push(pdfPromise);
        }
      });
      
      if (pdfFiles.length === 0) {
        // List all files found for debugging
        const allFiles: string[] = [];
        zipContent.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            allFiles.push(zipEntry.name);
          }
        });
        reject(new Error(`No PDF files found in ZIP archive. Files found: ${allFiles.join(', ')}`));
        return;
      }
      
      Promise.all(pdfFiles).then(resolve).catch(reject);
    }).catch((error) => {
      reject(new Error(`Failed to extract ZIP file: ${error.message}`));
    });
  });
}

export function validatePDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}