import React from 'react';
import { useAppStore, useActiveFile } from '@/lib/store';

export function StatusBar() {
  const { state } = useAppStore();
  const activeFile = useActiveFile();

  return (
    <footer className="h-statusbar bg-muted/30 border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <span>
              Page {state.currentPage} of {activeFile.pageCount}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span>
              Zoom {Math.round(state.zoom * 100)}%
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>Ready</span>
        {/* Additional status indicators would go here */}
      </div>
    </footer>
  );
}