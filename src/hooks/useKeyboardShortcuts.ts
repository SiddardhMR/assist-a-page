import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function useKeyboardShortcuts() {
  const { state, dispatch } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const isCmd = event.metaKey || event.ctrlKey;

      switch (event.key) {
        case '/':
          event.preventDefault();
          // Focus search - could dispatch a search focus action
          break;
        
        case 'f':
          if (isCmd) {
            event.preventDefault();
            // Focus in-document search
          }
          break;
        
        case 'k':
          if (isCmd) {
            event.preventDefault();
            // Open command palette
          }
          break;

        case 'b':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'TOGGLE_SIDEBAR' });
          }
          break;

        case 'm':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'TOGGLE_CHAT' });
          }
          break;

        case 'd':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'TOGGLE_THEME' });
          }
          break;

        case '1':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'SET_VIEW_MODE', mode: 'single' });
          }
          break;

        case '2':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'SET_VIEW_MODE', mode: 'spread' });
          }
          break;

        case '3':
          if (isCmd) {
            event.preventDefault();
            dispatch({ type: 'SET_VIEW_MODE', mode: 'continuous' });
          }
          break;

        case 'Escape':
          // Clear selections, close modals, etc.
          dispatch({ type: 'SET_SELECTED_TEXT', text: null });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // Return current shortcuts for help display
  return {
    shortcuts: [
      { key: '/', description: 'Focus search' },
      { key: 'Cmd+F', description: 'Search in PDF' },
      { key: 'Cmd+K', description: 'Command palette' },
      { key: 'Cmd+B', description: 'Toggle sidebar' },
      { key: 'Cmd+M', description: 'Toggle chat' },
      { key: 'Cmd+D', description: 'Toggle theme' },
      { key: '[', description: 'Previous page' },
      { key: ']', description: 'Next page' },
      { key: '+', description: 'Zoom in' },
      { key: '-', description: 'Zoom out' },
      { key: '0', description: 'Fit to width' },
      { key: 'Cmd+1/2/3', description: 'View modes' },
    ]
  };
}