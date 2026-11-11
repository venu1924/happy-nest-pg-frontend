import { useState } from 'react';
import { askAssistant } from '../services/assistantService';

const EXAMPLES = [
  'Aditya is in which room?',
  'Who has not paid this month rent?',
  'Who paid this month rent?',
  'How many temporary residents are there?',
  'How many vacant beds are on floor 4?',
];

export default function Assistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  const ask = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'you', text: trimmed }]);
    setBusy(true);
    try {
      const answer = await askAssistant(trimmed);
      setMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: err.message || 'Unable to ask the assistant.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col">
      <header>
        <h1 className="font-display text-2xl font-semibold text-nest-navy">Assistant</h1>
        <p className="mt-1 text-sm text-nest-muted">
          Ask anything about residents, rooms, rent, advance, or temporary stays. Answers use only the data saved in the app.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => ask(example)}
            className="rounded-full border border-nest-line bg-white px-3 py-1.5 text-left text-xs text-nest-navy"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-nest-muted">
            For advance, write “advance paid” or “advance not paid” in the resident notes. The assistant reads those notes.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.role === 'you'
                ? 'ml-8 bg-nest-navy text-white'
                : 'mr-8 border border-nest-line bg-white text-nest-navy'
            }`}
          >
            {message.text}
          </div>
        ))}
        {busy && <p className="text-sm text-nest-muted">Looking at the records…</p>}
      </div>

      <form
        className="sticky bottom-0 mt-4 flex gap-2 bg-nest-soft py-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="min-h-12 flex-1 rounded-xl border border-nest-line bg-white px-3 text-sm outline-none focus:border-nest-navy/40"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="min-h-12 rounded-xl bg-nest-navy px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
