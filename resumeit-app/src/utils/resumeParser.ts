import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
let pdfjsLib: any | null = null;

async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (pdfjsLib) {
    return pdfjsLib;
  }

  try {
    const lib = await import('pdfjs-dist/build/pdf');
    (lib as any).GlobalWorkerOptions.workerSrc =
      `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(lib as any).version}/pdf.worker.min.js`;

    pdfjsLib = lib;
    return lib;
  } catch (err) {
    console.error('Failed to load PDF.js library:', err);
    return null;
  }
}

async function extractPdfText(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const lib = await loadPdfJs();
    if (!lib) {
      console.warn('PDF.js library not available');
      return '';
    }

    const data = new Uint8Array(await file.arrayBuffer());

    const loadingTask = (lib as any).getDocument({ data });
    try {
      const pdf = await loadingTask.promise;
      const texts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item?.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          texts.push(pageText);
        }
      }

      return texts.join('\n').replace(/\n{2,}/g, '\n').trim();
    } finally {
      try {
        (loadingTask as any).destroy();
      } catch {
        // no-op
      }
    }
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    // Try OCR as fallback
    try {
      console.log('Attempting OCR fallback after error...');
      return await extractPdfWithOCR(file);
    } catch (ocrErr) {
      console.warn('OCR fallback failed:', ocrErr);
      return '';
    }
  }
}
async function extractDocxText(file: File): Promise<string> {
  try {
    console.log('Extracting text from DOCX file:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const text = result.value
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|div|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('DOCX extraction completed. Text length:', text.length);
    if (result.messages.length > 0) {
      console.warn('DOCX conversion warnings:', result.messages);
    }
    return text;
  } catch (e) {
    console.error('DOCX parse failed:', e);
    return '';
  }
}
async function extractTxt(file: File): Promise<string> {
  try {
    const buf = await file.text();
    return buf.replace(/\s+/g, ' ').trim();
  } catch (e) {
    console.warn('TXT read failed:', e);
    return '';
  }
}
async function extractPdfWithOCR(file: File): Promise<string> {
  try {
    console.log('Attempting OCR-based text extraction for PDF:', file.name);
    
    // Check if Tesseract is available
    if (typeof Tesseract === 'undefined') {
      console.warn('Tesseract OCR not available - install tesseract.js for OCR support');
      return '';
    }
    
    // CRITICAL: Tesseract cannot process PDF blobs directly - it needs images
    // For proper OCR of PDFs, we would need to:
    // 1. Render PDF pages to canvas
    // 2. Convert canvas to image
    // 3. Run OCR on the image
    // This is complex and not implemented here
    // So we skip OCR for PDFs and only use it as a last resort for image files
    console.warn('OCR cannot process PDF files directly - requires PDF-to-image conversion (not implemented)');
    return '';
    
    // The code below would work for image files, but not PDFs:
    /*
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    
    // Use a timeout for OCR (can be slow)
    const ocrPromise = Tesseract.recognize(blob, 'eng', {
      logger: (info: { status: string; progress?: number }) => {
        if (info.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round((info.progress || 0) * 100)}%`);
        }
      },
    });
    
    // 30 second timeout for OCR
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000);
    });
    
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    const text = result.data.text.trim();
    console.log('OCR extraction completed. Text length:', text.length);
    return text;
    */
  } catch (err) {
    // OCR errors are expected for PDFs - don't log as error
    if (err instanceof Error && err.message.includes('timeout')) {
      console.warn('OCR extraction timed out - PDF may be too large or complex');
    } else if (err instanceof Error && err.message.includes('read image')) {
      console.warn('OCR cannot process PDF files directly - requires image conversion');
    } else {
      console.warn('OCR-based text extraction failed (expected for PDFs):', err instanceof Error ? err.message : String(err));
    }
    return '';
  }
}
/**
 * Simplified resume parser - TXT files only
 * PDF/DOCX files MUST be processed by backend (multi-library parsing)
 * This function is only used as fallback when backend is unavailable
 */
export async function parseResume(file: File, timeout: number = 30000): Promise<string> {
  console.log('[CLIENT-SIDE PARSER] Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
  
  if (!file) {
    throw new Error('No file provided');
  }
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('File size exceeds 50MB limit');
  }
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  // CRITICAL: Only support TXT files in client-side parser
  // PDF/DOCX require backend with multi-library parsing
  if (ext !== 'txt') {
    throw new Error(`Client-side parser only supports TXT files. ${ext?.toUpperCase()} files require backend server with multi-library PDF parsing (pdfplumber, pdfminer.six, PyPDF2).`);
  }
  
  // Simple TXT file reading
  try {
    const text = await extractTxt(file);
    console.log('[CLIENT-SIDE PARSER] Extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('[CLIENT-SIDE PARSER] Failed to read TXT file:', error);
    throw error;
  }
}
(globalThis as any).testPdfParsing = async (file: File) => {
  console.log('=== PDF Parsing Debug Test ===');
  console.log('File:', file.name, 'Type:', file.type, 'Size:', file.size);
  try {
    const result = await parseResume(file);
    console.log('Parsing result length:', result.length);
    console.log('First 500 characters:', result.substring(0, 500));
    return result;
  } catch (err) {
    console.error('Parsing failed:', err);
    return null;
  }
};