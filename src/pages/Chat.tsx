import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, ArrowLeft, RotateCcw, Copy, Sparkles, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActiveFile, useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Array<{ page: number; bbox: number[] }>;
}

export function Chat() {
  const navigate = useNavigate();
  const activeFile = useActiveFile();
  const { state, dispatch } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I've analyzed your document "${activeFile?.name}" and I'm ready to help. I can answer questions, provide summaries, extract key insights, and more. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeFile) {
      navigate('/');
      return;
    }
  }, [activeFile, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `Based on your document, I can provide insights about "${input.slice(0, 50)}...". This is a comprehensive response that addresses your question with relevant information from the PDF content. I've analyzed the document structure and extracted the most relevant information to answer your query.`,
        timestamp: new Date(),
        citations: [
          { page: Math.floor(Math.random() * (activeFile?.pageCount || 5)) + 1, bbox: [100, 200, 400, 220] }
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const jumpToPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', page });
    // Could open a mini PDF viewer or navigate to a viewer page
  };

  if (!activeFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold text-sm text-foreground truncate max-w-[200px]">
                {activeFile.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeFile.pageCount} pages • AI Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
            <Sparkles className="h-3 w-3" />
            <span>AI Ready</span>
          </div>
          
          <Button variant="ghost" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  "group relative max-w-[85%] sm:max-w-[75%]",
                  message.type === 'user' ? "order-first" : ""
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card border border-border shadow-soft"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.citations.map((citation, index) => (
                        <button
                          key={index}
                          onClick={() => jumpToPage(citation.page)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs transition-colors mr-1"
                        >
                          📄 Page {citation.page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {message.type === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => console.log('Retry message')}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">You</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your document..."
                disabled={isLoading}
                className="pr-12 py-3 text-sm border-border/50 focus:border-primary resize-none rounded-xl"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Can you summarize this document?")}
              className="text-xs"
              disabled={isLoading}
            >
              💡 Summarize document
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("What are the key points in this document?")}
              className="text-xs"
              disabled={isLoading}
            >
              🎯 Key points
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Can you extract important quotes or data?")}
              className="text-xs"
              disabled={isLoading}
            >
              📊 Extract data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}