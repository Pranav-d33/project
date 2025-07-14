import { useMutation } from 'react-query';

export interface ExplainRequest {
  question: string;
  context?: string;
}

export function useExplain() {
  return useMutation(async ({ question, context }: ExplainRequest) => {
    // The backend expects a string body (the question) for /api/dashboard/copilot
    const res = await fetch('/api/dashboard/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (!res.ok) {
      throw new Error('Failed to get explanation');
    }
    return res.json();
  });
}
