import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { pdfManager } from '@/lib/pdf';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/debounce';

interface FileUploaderProps {
  className?: string;
  multiple?: boolean;
  onUploadComplete?: (files: any[]) => void;
}

export function FileUploader({ 
  className, 
  multiple = true, 
  onUploadComplete 
}: FileUploaderProps) {
  const { dispatch } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const processFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      setErrors(new Map([['format', 'Please select PDF files only']]));
      return;
    }

    // Clear previous errors
    setErrors(new Map());

    for (const file of pdfFiles) {
      const fileId = crypto.randomUUID();
      setUploadingFiles(prev => new Set([...prev, fileId]));

      try {
        // Load PDF with pdfjs to get metadata
        const pdfDoc = await pdfManager.loadDocument(file);
        
        // Upload to backend (in mock mode this will return immediately)
        await apiClient.upload(file);
        
        // Add to app state
        const newFile = {
          id: pdfDoc.id,
          name: file.name,
          pageCount: pdfDoc.pageCount,
          uploadedAt: new Date(),
        };
        
        dispatch({ type: 'ADD_FILE', file: newFile });
        
        // Generate thumbnails for first few pages
        for (let i = 1; i <= Math.min(3, pdfDoc.pageCount); i++) {
          pdfManager.getThumbnail(pdfDoc.id, i).catch(console.warn);
        }
        
      } catch (error) {
        console.error('Upload error:', error);
        setErrors(prev => new Map([...prev, [file.name, 'Failed to upload file']]));
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
      }
    }

    onUploadComplete?.(pdfFiles);
  }, [dispatch, onUploadComplete]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
    // Reset input
    event.target.value = '';
  }, [processFiles]);

  const isUploading = uploadingFiles.size > 0;

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor="file-upload">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary hover:bg-primary/5",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium">Uploading files...</p>
                <p className="text-xs text-muted-foreground">
                  Processing {uploadingFiles.size} file{uploadingFiles.size > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {isDragging ? 'Drop your PDFs here' : 'Upload PDF Documents'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your files here, or{' '}
                  <span className="text-primary font-medium">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports PDF files up to 50MB each
                </p>
              </div>
            </div>
          )}
        </div>
      </label>

      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Error Messages */}
      {errors.size > 0 && (
        <div className="mt-4 space-y-2">
          {Array.from(errors.entries()).map(([key, message]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
            >
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                <span className="font-medium">{key}:</span> {message}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto"
                onClick={() => {
                  setErrors(prev => {
                    const next = new Map(prev);
                    next.delete(key);
                    return next;
                  });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}