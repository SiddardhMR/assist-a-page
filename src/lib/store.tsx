import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface PDFFile {
  id: string;
  name: string;
  pageCount: number;
  lastPage?: number;
  lastZoom?: number;
  uploadedAt: Date;
}

export interface AppState {
  activeFileId: string | null;
  files: PDFFile[];
  currentPage: number;
  zoom: number;
  viewMode: 'single' | 'spread' | 'continuous';
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  chatCollapsed: boolean;
  searchQuery: string;
  searchResults: any[];
  selectedText: string | null;
  highlights: Map<string, any[]>; // documentId -> highlights
}

type AppAction =
  | { type: 'SET_ACTIVE_FILE'; fileId: string | null }
  | { type: 'ADD_FILE'; file: PDFFile }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_VIEW_MODE'; mode: 'single' | 'spread' | 'continuous' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_SEARCH'; query: string; results: any[] }
  | { type: 'SET_SELECTED_TEXT'; text: string | null }
  | { type: 'ADD_HIGHLIGHT'; documentId: string; highlight: any }
  | { type: 'REMOVE_HIGHLIGHT'; documentId: string; highlightId: string }
  | { type: 'LOAD_PERSISTED_STATE'; state: Partial<AppState> };

const initialState: AppState = {
  activeFileId: null,
  files: [],
  currentPage: 1,
  zoom: 1.2,
  viewMode: 'single',
  theme: 'light',
  sidebarCollapsed: false,
  chatCollapsed: false,
  searchQuery: '',
  searchResults: [],
  selectedText: null,
  highlights: new Map(),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFileId: action.fileId };
    
    case 'ADD_FILE':
      return {
        ...state,
        files: [...state.files.filter(f => f.id !== action.file.id), action.file],
        activeFileId: action.file.id,
      };
    
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter(f => f.id !== action.fileId),
        activeFileId: state.activeFileId === action.fileId ? null : state.activeFileId,
      };
    
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'TOGGLE_CHAT':
      return { ...state, chatCollapsed: !state.chatCollapsed };
    
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query, searchResults: action.results };
    
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.text };
    
    case 'ADD_HIGHLIGHT':
      const newHighlights = new Map(state.highlights);
      const existingHighlights = newHighlights.get(action.documentId) || [];
      newHighlights.set(action.documentId, [...existingHighlights, action.highlight]);
      return { ...state, highlights: newHighlights };
    
    case 'REMOVE_HIGHLIGHT':
      const updatedHighlights = new Map(state.highlights);
      const currentHighlights = updatedHighlights.get(action.documentId) || [];
      updatedHighlights.set(
        action.documentId,
        currentHighlights.filter(h => h.id !== action.highlightId)
      );
      return { ...state, highlights: updatedHighlights };
    
    case 'LOAD_PERSISTED_STATE':
      return { ...state, ...action.state };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pdf-assistant-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_PERSISTED_STATE', state: parsed });
      } catch (error) {
        console.warn('Failed to load persisted state:', error);
      }
    }

    // Load theme from system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!savedState && prefersDark) {
      dispatch({ type: 'TOGGLE_THEME' });
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    const stateToSave = {
      files: state.files,
      currentPage: state.currentPage,
      zoom: state.zoom,
      viewMode: state.viewMode,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      chatCollapsed: state.chatCollapsed,
    };
    localStorage.setItem('pdf-assistant-state', JSON.stringify(stateToSave));
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}

// Selector hooks for convenience
export function useActiveFile() {
  const { state } = useAppStore();
  return state.files.find(f => f.id === state.activeFileId) || null;
}

export function useTheme() {
  const { state, dispatch } = useAppStore();
  return {
    theme: state.theme,
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
  };
}