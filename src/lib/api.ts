const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const MOCK_MODE = import.meta.env.VITE_MOCK === '1';

export interface APIError {
  message: string;
  status: number;
  code?: string;
}

export interface UploadResponse {
  fileId: string;
  name: string;
  pageCount: number;
}

export interface ExtractResponse {
  chunks: Array<{
    id: string;
    fileId: string;
    page: number;
    text: string;
    bbox?: number[];
  }>;
}

export interface SearchResponse {
  matches: Array<{
    page: number;
    text: string;
    start: number;
    end: number;
    bbox?: number[];
  }>;
}

export interface ChatMessage {
  type: 'token' | 'citation' | 'done';
  data: string | { page: number; bbox: number[] };
}

class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (MOCK_MODE) {
      return this.mockRequest<T>(endpoint, options);
    }

    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = {
        message: response.statusText,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  private async mockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

    if (endpoint === '/upload') {
      return {
        fileId: crypto.randomUUID(),
        name: 'mock-document.pdf',
        pageCount: 10,
      } as T;
    }

    if (endpoint === '/extract') {
      return {
        chunks: Array.from({ length: 5 }, (_, i) => ({
          id: crypto.randomUUID(),
          fileId: 'mock-file-id',
          page: i + 1,
          text: `Mock extracted text from page ${i + 1}. This is sample content that would be extracted from a PDF document.`,
          bbox: [100, 100, 400, 120],
        })),
      } as T;
    }

    if (endpoint === '/search') {
      return {
        matches: [
          {
            page: 1,
            text: 'Sample search result text',
            start: 0,
            end: 25,
            bbox: [100, 200, 300, 220],
          },
          {
            page: 3,
            text: 'Another search match',
            start: 50,
            end: 70,
            bbox: [150, 300, 350, 320],
          },
        ],
      } as T;
    }

    throw new Error(`Mock endpoint ${endpoint} not implemented`);
  }

  async upload(file: File): Promise<UploadResponse> {
    if (MOCK_MODE) {
      return this.mockRequest('/upload', {});
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async extract(fileId: string, pages?: number[]): Promise<ExtractResponse> {
    return this.request('/extract', {
      method: 'POST',
      body: JSON.stringify({ fileId, pages }),
    });
  }

  async search(fileId: string, query: string): Promise<SearchResponse> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ fileId, query }),
    });
  }

  // Server-Sent Events for chat streaming
  createChatStream(
    fileId: string,
    question: string,
    selection?: { page: number; text: string }
  ): EventSource | AsyncGenerator<ChatMessage> {
    if (MOCK_MODE) {
      return this.mockChatStream(question);
    }

    const params = new URLSearchParams({
      fileId,
      question,
      ...(selection && { 
        page: selection.page.toString(),
        text: selection.text 
      })
    });

    const eventSource = new EventSource(`${BASE_URL}/ask?${params}`);
    return eventSource;
  }

  private async *mockChatStream(question: string): AsyncGenerator<ChatMessage> {
    const words = [
      'Based', 'on', 'the', 'document', 'content,', 'I', 'can', 'provide', 
      'the', 'following', 'answer:', 'This', 'is', 'a', 'mock', 'response', 
      'to', 'your', 'question', 'about', question.slice(0, 20) + '...'
    ];

    // Stream tokens
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      yield { type: 'token', data: word + ' ' } as ChatMessage;
    }

    // Add citation
    await new Promise(resolve => setTimeout(resolve, 200));
    yield {
      type: 'citation',
      data: { page: 1, bbox: [100, 200, 400, 220] }
    } as ChatMessage;

    // End stream
    yield { type: 'done', data: '' } as ChatMessage;
  }
}

export const apiClient = new APIClient();