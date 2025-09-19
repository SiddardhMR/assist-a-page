import React from 'react';
import { TopBar } from '@/components/TopBar';
import { SidePanel } from '@/components/SidePanel';
import { PdfViewer } from '@/components/PdfViewer';
import { ChatPane } from '@/components/ChatPane';
import { StatusBar } from '@/components/StatusBar';
import { AppProvider } from '@/lib/store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppContent() {
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        <SidePanel />
        <PdfViewer />
        <ChatPane />
      </div>
      
      <StatusBar />
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
