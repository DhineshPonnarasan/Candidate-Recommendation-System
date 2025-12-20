import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
let pdfjsLib: any | null = null;
async function loadPdfJs(): Promise<any> {
  try {
    console.log('Loading PDF.js library...');
    const lib = await import('pdfjs-dist');
    const workerStrategies = [
      {
        name: 'Local worker file',
        path: '/pdf.worker.mjs'
      },
      {
        name: 'CDN worker (4.10.38)',
        path: 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.mjs'
      },
      {
        name: 'CDN worker (4.6.82)',
        path: 'https://unpkg.com/pdfjs-dist@4.6.82/build/pdf.worker.mjs'
      },
      {
        name: 'CDN worker (latest)',
        path: 'https://unpkg.com/pdfjs-dist/build/pdf.worker.mjs'
      },
      {
        name: 'Disable worker',
        path: null // This will use the main thread
      }
    ];
    for (const strategy of workerStrategies) {
      try {
        console.log(`Trying worker strategy: ${strategy.name}`);
        if (strategy.path) {
          (lib as any).GlobalWorkerOptions.workerSrc = strategy.path;
        } else {
          delete (lib as any).GlobalWorkerOptions.workerSrc;
          (lib as any).GlobalWorkerOptions.workerSrc = '';
        }
        console.log('PDF.js worker configured with:', strategy.name);
        break; // Use first working strategy
      } catch (workerErr) {
        console.warn(`Worker strategy failed: ${strategy.name}`, workerErr);
        continue;
      }
    }
    console.log('PDF.js library loaded successfully');
    return lib;
  } catch (err) {
    console.error('Failed to load PDF.js library:', err);
    return null;
  }
}
async function extractPdfText(file: File): Promise<string> {
  try {
    const lib = await loadPdfJs();
    if (!lib) {
      console.warn('PDF.js library not available');
      return '';
    }
    console.log('Loading PDF file:', file.name, 'Size:', file.size);
    const data = new Uint8Array(await file.arrayBuffer());
    const v = (lib as any).version || '4.10.38';
    const configs = [
      {
        name: 'Standard config',
        config: {
          data,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${v}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${v}/standard_fonts/`,
          useWorkerFetch: false,
          isEvalSupported: false,
          verbosity: 0,
        }
      },
      {
        name: 'Minimal config',
        config: {
          data,
          useWorkerFetch: false,
          isEvalSupported: false,
          verbosity: 0,
        }
      },
      {
        name: 'Basic config',
        config: {
          data
        }
      }
    ];
    for (const { name, config } of configs) {
      try {
        console.log(`Trying PDF loading with: ${name}`);
        const loadingTask = (lib as any).getDocument(config);
        const pdf = await loadingTask.promise;
        console.log('PDF loaded successfully. Pages:', pdf.numPages);
        const texts: string[] = [];
        const maxPages = Math.min(pdf.numPages, 5);
        for (let i = 1; i <= maxPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Production-grade text extraction: preserve reading order and layout
            // This is how FAANG companies extract text - maintaining line structure
            const textItems: Array<{str: string; y: number; x: number}> = [];
            
            for (const item of textContent.items) {
              if (item.str && item.str.trim()) {
                // Get text position for ordering
                const transform = item.transform || [1, 0, 0, 1, 0, 0];
                const x = transform[4] || 0;
                const y = transform[5] || 0;
                textItems.push({
                  str: item.str,
                  y: -y, // Negate because PDF Y increases downward
                  x: x
                });
              }
            }
            
            // Sort by reading order: top to bottom (higher Y first), then left to right
            textItems.sort((a, b) => {
              const yDiff = b.y - a.y; // Higher Y (top) comes first
              if (Math.abs(yDiff) > 5) { // Different lines (>5px difference)
                return yDiff;
              }
              return a.x - b.x; // Same line: left to right
            });
            
            // Group into lines (items with similar Y coordinates)
            const lines: string[] = [];
            let currentLine: string[] = [];
            let currentY = null;
            const yThreshold = 8; // Pixels - items within this are same line
            
            for (const item of textItems) {
              if (currentY === null) {
                currentY = item.y;
                currentLine = [item.str];
              } else if (Math.abs(item.y - currentY) < yThreshold) {
                // Same line
                currentLine.push(item.str);
              } else {
                // New line
                if (currentLine.length > 0) {
                  lines.push(currentLine.join(' '));
                }
                currentLine = [item.str];
                currentY = item.y;
              }
            }
            // Add last line
            if (currentLine.length > 0) {
              lines.push(currentLine.join(' '));
            }
            
            const pageText = lines.join('\n').trim();
            if (pageText) {
              texts.push(pageText);
            }
            console.log(`Page ${i} extracted: ${pageText.length} characters (${lines.length} lines)`);
          } catch (pageErr) {
            console.warn(`Failed to extract page ${i}:`, pageErr);
            continue;
          }
        }
        const fullText = texts.join('\n').trim();
        console.log('Total extracted text length:', fullText.length);
        
        // Log sample of extracted text for debugging
        if (fullText.length > 0) {
          console.log('Sample extracted text (first 300 chars):', fullText.substring(0, 300));
        } else {
          console.warn('WARNING: No text extracted from PDF. The PDF may be image-based or corrupted.');
        }
        
        try { 
          (loadingTask as any).destroy(); 
        } catch (destroyErr) {
          console.warn('Error destroying PDF task:', destroyErr);
        }
        return fullText;
      } catch (configErr) {
        const errMsg = configErr instanceof Error ? configErr.message : String(configErr);
        // Only log as warning, not error, to avoid console.error noise
        if (name === 'Basic config') {
          // Last attempt - log more details
          console.warn(`PDF loading failed with ${name}:`, errMsg);
        } else {
          // Earlier attempts - minimal logging
          console.log(`PDF loading attempt "${name}" failed, trying next...`);
        }
        continue; // Try next configuration
      }
    }
    // All PDF.js configurations failed - this is expected for some PDFs
    // Don't log as error, just return empty and let OCR try
    console.log('PDF.js extraction failed - PDF may be image-based or require OCR');
    return '';
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