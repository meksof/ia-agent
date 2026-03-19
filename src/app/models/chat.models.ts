export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OllamaModel {
  name: string;
  model: string;
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

export interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}
