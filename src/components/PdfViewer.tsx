import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore, useActiveFile } from '@/lib/store';
import { pdfManager } from '@/lib/pdf';
import { cn } from '@/lib/utils';

export function PdfViewer() {
  const { state, dispatch } = useAppStore();
  const activeFile = useActiveFile();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderTime, setRenderTime] = useState(0);

  const renderPage = useCallback(async () => {
    if (!activeFile || !canvasRef.current) return;

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { canvas } = await pdfManager.renderPage(
        activeFile.id,
        state.currentPage,
        state.zoom
      );
      
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(canvas, 0, 0);
      }
      
      const endTime = performance.now();
      setRenderTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error('Failed to render page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFile, state.currentPage, state.zoom]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleZoomIn = () => {
    const newZoom = Math.min(state.zoom * 1.2, 5);
    dispatch({ type: 'SET_ZOOM', zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(state.zoom / 1.2, 0.2);
    dispatch({ type: 'SET_ZOOM', zoom: newZoom });
  };

  const handleFitToWidth = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40; // padding
      const canvasWidth = canvasRef.current.width / state.zoom;
      const newZoom = containerWidth / canvasWidth;
      dispatch({ type: 'SET_ZOOM', zoom: newZoom });
    }
  };

  const handlePrevPage = () => {
    if (state.currentPage > 1) {
      dispatch({ type: 'SET_PAGE', page: state.currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (activeFile && state.currentPage < activeFile.pageCount) {
      dispatch({ type: 'SET_PAGE', page: state.currentPage + 1 });
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return;

    switch (event.key) {
      case 'ArrowLeft':
      case '[':
        event.preventDefault();
        handlePrevPage();
        break;
      case 'ArrowRight':
      case ']':
        event.preventDefault();
        handleNextPage();
        break;
      case '+':
      case '=':
        event.preventDefault();
        handleZoomIn();
        break;
      case '-':
      case '_':
        event.preventDefault();
        handleZoomOut();
        break;
      case '0':
        event.preventDefault();
        handleFitToWidth();
        break;
    }
  }, [state.currentPage, activeFile]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-pdf-bg">
        <EmptyState 
          type="upload"
          title="No PDF Selected"
          description="Upload a PDF document to get started with AI-powered analysis"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-pdf-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={state.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {state.currentPage} / {activeFile.pageCount}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={state.currentPage >= activeFile.pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-mono px-2 min-w-[60px] text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleFitToWidth}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto custom-scrollbar p-4 flex justify-center"
      >
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Rendering page...
              </div>
            </div>
          )}
          
          <canvas
            ref={canvasRef}
            className={cn(
              "pdf-canvas max-w-full transition-opacity duration-200",
              isLoading && "opacity-50"
            )}
            style={{
              filter: state.theme === 'dark' ? 'invert(0.05)' : 'none'
            }}
          />
          
          {/* Selection overlay would go here */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Highlight overlays */}
          </div>
        </div>
      </div>

      {/* Status info */}
      {renderTime > 0 && (
        <div className="px-4 py-1 bg-muted/50 border-t border-border text-xs text-muted-foreground">
          Rendered in {renderTime}ms
        </div>
      )}
    </div>
  );
}