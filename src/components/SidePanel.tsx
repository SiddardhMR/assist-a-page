import React, { useState, useMemo } from 'react';
import { 
  File, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Upload,
  Folder,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/FileUploader';
import { EmptyState } from '@/components/EmptyState';
import { useAppStore, useActiveFile } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SidePanelProps {
  className?: string;
}

export function SidePanel({ className }: SidePanelProps) {
  const { state, dispatch } = useAppStore();
  const activeFile = useActiveFile();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    files: true,
    outline: false,
    search: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // This would integrate with your PDF loading logic
      const newFile = {
        id: crypto.randomUUID(),
        name: file.name,
        pageCount: 0, // Will be set after PDF loads
        uploadedAt: new Date(),
      };
      dispatch({ type: 'ADD_FILE', file: newFile });
    });
  };

  const recentFiles = useMemo(() => {
    return [...state.files]
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, 10);
  }, [state.files]);

  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
      state.sidebarCollapsed ? "w-0 overflow-hidden" : "w-sidebar",
      className
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-foreground">Documents</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Upload Area */}
        <FileUploader className="mb-4" />
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Files Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('files')}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Files</span>
            </div>
            {expandedSections.files ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
            <div className="pb-2">
              {recentFiles.length === 0 ? (
                <EmptyState 
                  type="upload"
                  title="No files uploaded yet"
                  description="Upload your first PDF to get started"
                />
              ) : (
                <div className="space-y-1">
                  {recentFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', fileId: file.id })}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors rounded-md mx-2",
                        file.id === state.activeFileId && "bg-primary/10 text-primary"
                      )}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.pageCount} pages
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Document Outline Section */}
        {activeFile && (
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection('outline')}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Outline</span>
              </div>
              {expandedSections.outline ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.outline && (
              <div className="pb-2 px-3">
                <div className="text-xs text-muted-foreground text-center py-2">
                  Outline will appear here when available
                </div>
              </div>
            )}
          </div>
        )}

        {/* In-Document Search Section */}
        {activeFile && (
          <div>
            <button
              onClick={() => toggleSection('search')}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Search in PDF</span>
              </div>
              {expandedSections.search ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.search && (
              <div className="pb-4 px-3 space-y-3">
                <Input
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
                
                {searchQuery && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Search results will appear here
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnails for active document */}
      {activeFile && (
        <div className="border-t border-border p-3">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Pages</h3>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
            {Array.from({ length: activeFile.pageCount || 10 }, (_, i) => (
              <button
                key={i}
                onClick={() => dispatch({ type: 'SET_PAGE', page: i + 1 })}
                className={cn(
                  "aspect-[3/4] border border-border rounded bg-pdf-bg hover:border-primary transition-colors relative",
                  state.currentPage === i + 1 && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}