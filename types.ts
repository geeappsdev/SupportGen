export interface ResponseFormat {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export type LinkFeedback = Record<string, 'good' | 'bad'>;

export interface Source {
  web: {
    uri: string;
    title: string;
  };
}
