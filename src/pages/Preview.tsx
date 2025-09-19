import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveFile } from '@/lib/store';
import { pdfManager } from '@/lib/pdf';

export function Preview() {
  const navigate = useNavigate();
  const activeFile = useActiveFile();
  const [countdown, setCountdown] = useState(5);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!activeFile) {
      navigate('/');
      return;
    }

    // Generate preview thumbnail
    const generatePreview = async () => {
      try {
        const canvas = await pdfManager.getThumbnail(activeFile.id, 1);
        setPreviewCanvas(canvas);
      } catch (error) {
        console.error('Failed to generate preview:', error);
      }
    };

    generatePreview();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/chat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeFile, navigate]);

  const handleStartChat = () => {
    navigate('/chat');
  };

  if (!activeFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Document Loaded Successfully!
          </h1>
          <p className="text-lg text-muted-foreground">
            {activeFile.name}
          </p>
        </div>

        {/* PDF Preview */}
        <div className="mb-8">
          <div className="bg-card rounded-xl border border-border shadow-medium p-6 mb-6">
            <div className="aspect-[3/4] max-w-xs mx-auto bg-pdf-bg rounded-lg border border-pdf-border overflow-hidden shadow-soft">
              {previewCanvas ? (
                <canvas
                  ref={(ref) => {
                    if (ref && previewCanvas) {
                      const ctx = ref.getContext('2d');
                      ref.width = previewCanvas.width;
                      ref.height = previewCanvas.height;
                      ctx?.drawImage(previewCanvas, 0, 0);
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {activeFile.pageCount} pages loaded
              </p>
              <p className="text-xs text-muted-foreground">
                Ready for AI analysis and conversation
              </p>
            </div>
          </div>
        </div>

        {/* Auto-redirect message */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Starting conversation in {countdown} seconds...
            </span>
          </div>
          
          <Button 
            onClick={handleStartChat}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Start Conversation Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-sm mb-2">✨ What you can do:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ask questions about the content</li>
              <li>• Get instant summaries</li>
              <li>• Extract key insights</li>
            </ul>
          </div>
          
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-sm mb-2">🎯 AI Features:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Smart text analysis</li>
              <li>• Contextual responses</li>
              <li>• Page-specific citations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}