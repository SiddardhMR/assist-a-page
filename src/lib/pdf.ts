import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker setup - you can swap CDN for local worker if needed
// For local: '/node_modules/pdfjs-dist/build/pdf.worker.min.js'
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface PDFDocument {
  id: string;
  name: string;
  pageCount: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}

export interface PDFPage {
  pageNum: number;
  viewport: pdfjsLib.PageViewport;
  canvas?: HTMLCanvasElement;
  textLayer?: TextLayerItem[];
}

export interface TextLayerItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

export interface HighlightBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

class PDFManager {
  private cache = new Map<string, PDFDocument>();
  private pageCache = new Map<string, PDFPage>();

  async loadDocument(file: File): Promise<PDFDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const document: PDFDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      pageCount: pdfDoc.numPages,
      pdfDoc
    };
    
    this.cache.set(document.id, document);
    return document;
  }

  async renderPage(
    documentId: string, 
    pageNum: number, 
    scale: number = 1.5
  ): Promise<{ canvas: HTMLCanvasElement; textLayer: TextLayerItem[] }> {
    const cacheKey = `${documentId}-${pageNum}-${scale}`;
    
    if (this.pageCache.has(cacheKey)) {
      const cached = this.pageCache.get(cacheKey)!;
      if (cached.canvas && cached.textLayer) {
        return { canvas: cached.canvas, textLayer: cached.textLayer };
      }
    }

    const document = this.cache.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const page = await document.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    // Render to canvas
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    };

    await page.render(renderContext).promise;

    // Extract text layer
    const textContent = await page.getTextContent();
    const textLayer: TextLayerItem[] = textContent.items
      .filter((item): item is any => 'str' in item)
      .map(item => ({
        str: item.str,
        dir: item.dir,
        width: item.width,
        height: item.height,
        transform: item.transform,
        fontName: item.fontName,
        hasEOL: item.hasEOL
      }));

    // Cache the result
    this.pageCache.set(cacheKey, {
      pageNum,
      viewport,
      canvas,
      textLayer
    });

    return { canvas, textLayer };
  }

  async getThumbnail(documentId: string, pageNum: number): Promise<HTMLCanvasElement> {
    const cacheKey = `${documentId}-${pageNum}-thumb`;
    
    if (this.pageCache.has(cacheKey)) {
      const cached = this.pageCache.get(cacheKey)!;
      if (cached.canvas) {
        return cached.canvas;
      }
    }

    const document = this.cache.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const page = await document.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.3 });
    
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }).promise;

    this.pageCache.set(cacheKey, {
      pageNum,
      viewport,
      canvas
    });

    return canvas;
  }

  getDocument(id: string): PDFDocument | undefined {
    return this.cache.get(id);
  }

  removeDocument(id: string): void {
    this.cache.delete(id);
    // Clean up page cache for this document
    const keysToDelete = Array.from(this.pageCache.keys())
      .filter(key => key.startsWith(id));
    keysToDelete.forEach(key => this.pageCache.delete(key));
  }

  // Utility functions for highlight overlays
  textToHighlightBoxes(
    textLayer: TextLayerItem[],
    searchText: string,
    viewport: pdfjsLib.PageViewport
  ): HighlightBox[] {
    const boxes: HighlightBox[] = [];
    const normalizedSearch = searchText.toLowerCase();
    
    let currentText = '';
    let startIndex = -1;
    
    textLayer.forEach((item, index) => {
      currentText += item.str.toLowerCase();
      
      const searchIndex = currentText.indexOf(normalizedSearch);
      if (searchIndex !== -1 && startIndex === -1) {
        startIndex = index;
      }
      
      if (startIndex !== -1 && currentText.length >= searchIndex + normalizedSearch.length) {
        // Found complete match, create highlight box
        const startItem = textLayer[startIndex];
        const transform = startItem.transform;
        
        boxes.push({
          left: transform[4],
          top: viewport.height - transform[5] - startItem.height,
          width: item.width,
          height: startItem.height
        });
        
        // Reset for next match
        currentText = '';
        startIndex = -1;
      }
    });
    
    return boxes;
  }

  // Clear cache to manage memory
  clearCache(keepRecent = 10): void {
    if (this.pageCache.size <= keepRecent) return;
    
    const entries = Array.from(this.pageCache.entries());
    const toDelete = entries.slice(0, entries.length - keepRecent);
    toDelete.forEach(([key]) => this.pageCache.delete(key));
  }
}

export const pdfManager = new PDFManager();