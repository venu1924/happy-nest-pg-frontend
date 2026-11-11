import { API_BASE_URL } from './api';
import { clearSession, getStoredToken } from './authStorage';

export async function streamAssistant(question, history, onToken) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/assistant/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, history }),
  });

  if (response.status === 401) {
    clearSession();
    window.location.assign('/login');
    return;
  }
  if (!response.ok || !response.body) {
    throw new Error('Unable to ask the assistant.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const event of events) {
      const data = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).replace(/^ /, ''))
        .join('\n');
      if (data && data !== '[DONE]') onToken(data);
    }
  }
}
