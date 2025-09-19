import React from 'react';
import { AppProvider } from '@/lib/store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Upload } from "@/pages/Upload";
import { Preview } from "@/pages/Preview";
import { Chat } from "@/pages/Chat";

const queryClient = new QueryClient();

function AppContent() {
  useKeyboardShortcuts();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
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
