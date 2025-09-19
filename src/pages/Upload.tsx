import React from 'react';
import { FileText, Sparkles, Zap, Brain } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export function Upload() {
  const { state } = useAppStore();
  const navigate = useNavigate();

  const handleUploadComplete = (files: File[]) => {
    if (files.length > 0) {
      // Navigate to preview after a short delay to show upload completion
      setTimeout(() => {
        navigate('/preview');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDF Assistant
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered document analysis</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-hard">
              <Brain className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Transform Your PDFs with AI
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Upload any PDF and get instant insights, summaries, and answers to your questions
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground text-center">
                  AI-powered content extraction and understanding
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Answers</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Ask questions and get precise answers with citations
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Rich Summaries</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Generate comprehensive summaries and key insights
                </p>
              </div>
            </div>
          </div>

          {/* Upload Component */}
          <FileUploader onUploadComplete={handleUploadComplete} />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">
              Supports PDF files up to 50MB • Your documents are processed securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}