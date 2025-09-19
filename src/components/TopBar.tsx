import React from 'react';
import { Search, Upload, FileText, MessageSquare, Settings, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, useTheme } from '@/lib/store';

export function TopBar() {
  const { state, dispatch } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Handle file upload logic here
      console.log('Uploading file:', file.name);
    });
  };

  return (
    <header className="h-topbar bg-background border-b border-border flex items-center justify-between px-4 shadow-soft">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="md:hidden"
        >
          {state.sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            PDF Assistant
          </h1>
        </div>
      </div>

      {/* Center section - Global search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all documents..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-1 mr-2">
          <label htmlFor="file-upload">
            <Button variant="toolbar" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button variant="toolbar" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Extract
          </Button>
          
          <Button variant="toolbar" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask
          </Button>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden lg:flex items-center gap-1 mr-2 p-1 bg-muted rounded-md">
          <Button
            variant={state.viewMode === 'single' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'single' })}
            className="text-xs px-2 py-1 h-7"
          >
            1-Page
          </Button>
          <Button
            variant={state.viewMode === 'spread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'spread' })}
            className="text-xs px-2 py-1 h-7"
          >
            2-Page
          </Button>
          <Button
            variant={state.viewMode === 'continuous' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'continuous' })}
            className="text-xs px-2 py-1 h-7"
          >
            Scroll
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Chat Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}