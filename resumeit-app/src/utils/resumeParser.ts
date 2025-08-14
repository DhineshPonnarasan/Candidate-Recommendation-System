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
            const pageText = textContent.items
              .map((item: any) => item.str || '')
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (pageText) {
              texts.push(pageText);
            }
            console.log(`Page ${i} extracted: ${pageText.length} characters`);
          } catch (pageErr) {
            console.warn(`Failed to extract page ${i}:`, pageErr);
            continue;
          }
        }
        const fullText = texts.join('\n').trim();
        console.log('Total extracted text length:', fullText.length);
        try { 
          (loadingTask as any).destroy(); 
        } catch (destroyErr) {
          console.warn('Error destroying PDF task:', destroyErr);
        }
        return fullText;
      } catch (configErr) {
        console.warn(`PDF loading failed with ${name}:`, configErr);
        continue; // Try next configuration
      }
    }
    console.error('All PDF loading configurations failed');
    return '';
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    return '';
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
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const result = await Tesseract.recognize(blob, 'eng', {
      logger: (info: { status: string; progress?: number }) => console.log(info),
    });
    const text = result.data.text.trim();
    console.log('OCR extraction completed. Text length:', text.length);
    return text;
  } catch (err) {
    console.error('OCR-based text extraction failed:', err);
    return '';
  }
}
export async function parseResume(file: File): Promise<string> {
  console.log('Starting resume parsing for file:', file.name, 'Type:', file.type, 'Size:', file.size);
  if (!file) {
    console.error('No file provided for parsing');
    throw new Error('No file provided');
  }
  if (file.size === 0) {
    console.error('File is empty');
    throw new Error('File is empty');
  }
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    console.error('File too large:', file.size);
    throw new Error('File size exceeds 50MB limit');
  }
  try {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let text = '';
    console.log('Detected file extension:', ext);
    if (ext === 'pdf') {
      console.log('Processing as PDF file');
      text = await extractPdfText(file);
      if (!text) {
        console.log('PDF parsing failed, trying alternative text extraction...');
        try {
          const textAttempt = await file.text();
          if (textAttempt && textAttempt.length > 50) {
            console.log('Alternative text extraction succeeded');
            text = textAttempt;
          } else {
            console.log('Attempting OCR-based extraction as a last resort...');
            text = await extractPdfWithOCR(file);
          }
        } catch (textErr) {
          console.warn('Alternative text extraction also failed:', textErr);
        }
      }
    } else if (ext === 'docx') {
      console.log('Processing as DOCX file');
      text = await extractDocxText(file);
    } else if (ext === 'txt') {
      console.log('Processing as TXT file');
      text = await extractTxt(file);
    } else {
      console.warn('Unsupported file format, attempting text extraction:', ext);
      text = await file.text();
    }
    text = text.trim();
    console.log('Resume parsing completed. Extracted text length:', text.length);
    if (!text) {
      console.warn('Unable to extract text from file. The file may be corrupted, image-based, or in an unsupported format.');
    }
    if (text.length < 50 && text.length > 0) {
      console.warn('Extracted text is very short, may indicate parsing issues');
    }
    return text; // Return whatever we got, even if empty
  } catch (error) {
    console.error('Resume parsing failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    console.warn(`Unable to process resume file: ${errorMessage}`);
    return ''; // Return empty string instead of throwing
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