import React from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'upload' | 'search' | 'chat';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  type = 'upload', 
  title, 
  description,
  action 
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'upload':
        return {
          icon: <Upload className="h-12 w-12 text-muted-foreground" />,
          title: title || "No Documents Yet",
          description: description || "Upload your first PDF to get started with AI-powered document analysis",
        };
      case 'search':
        return {
          icon: <FileText className="h-12 w-12 text-muted-foreground" />,
          title: title || "No Search Results",
          description: description || "Try different keywords or check your spelling",
        };
      case 'chat':
        return {
          icon: <MessageSquare className="h-12 w-12 text-muted-foreground" />,
          title: title || "Start a Conversation",
          description: description || "Ask questions about your document or select text to get started",
        };
      default:
        return {
          icon: <FileText className="h-12 w-12 text-muted-foreground" />,
          title: title || "Nothing Here Yet",
          description: description || "Content will appear here once you get started",
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {content.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {content.title}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mb-6">
        {content.description}
      </p>

      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}

      {type === 'upload' && (
        <div className="mt-8 space-y-2 text-xs text-muted-foreground">
          <p>✨ Features you'll unlock:</p>
          <ul className="space-y-1">
            <li>• AI-powered Q&A about your documents</li>
            <li>• Smart text extraction and search</li>
            <li>• Automatic highlights and citations</li>
            <li>• Document summarization</li>
          </ul>
        </div>
      )}
    </div>
  );
}