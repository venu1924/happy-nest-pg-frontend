import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { streamAssistant } from '../../services/assistantService';

const EXAMPLES = [
  'Who has not paid this month rent?',
  'How many vacant beds are there?',
  'How many temporary residents are there?',
];

export default function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  const ask = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'you', text: trimmed }, { role: 'ai', text: '' }]);
    setBusy(true);
    try {
      await streamAssistant(trimmed, (token) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'ai') {
            next[next.length - 1] = { ...last, text: last.text + token };
          }
          return next;
        });
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'ai' && !last.text) {
          next[next.length - 1] = { role: 'ai', text: err.message || 'Unable to ask the assistant.' };
        }
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-nest-navy/30">
          <button
            type="button"
            className="h-full flex-1"
            aria-label="Close assistant"
            onClick={() => setOpen(false)}
          />
          <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-soft">
            <header className="flex items-center justify-between border-b border-nest-line px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-nest-navy" aria-hidden />
                <h2 className="font-display text-base font-semibold text-nest-navy">AI Assistant</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-nest-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-nest-muted">
                    Ask anything saved in the app. If it is not in the records, the reply is “Data is unavailable.”
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => ask(example)}
                        className="rounded-full border border-nest-line px-3 py-1.5 text-left text-xs text-nest-navy"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl px-3 py-2.5 text-sm ${
                    message.role === 'you'
                      ? 'ml-8 bg-nest-navy text-white'
                      : 'mr-6 border border-nest-line bg-nest-soft text-nest-navy'
                  }`}
                >
                  {message.text || (busy && index === messages.length - 1 ? '…' : '')}
                </div>
              ))}
            </div>

            <form
              className="flex gap-2 border-t border-nest-line p-3"
              onSubmit={(event) => {
                event.preventDefault();
                ask(question);
              }}
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about the PG"
                className="min-h-12 flex-1 rounded-xl border border-nest-line px-3 text-sm outline-none focus:border-nest-navy/40"
              />
              <button
                type="submit"
                disabled={busy || !question.trim()}
                className="min-h-12 rounded-xl bg-nest-navy px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Ask
              </button>
            </form>
          </aside>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-nest-navy px-4 text-sm font-semibold text-white shadow-soft"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-5 w-5" aria-hidden />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>
    </>
  );
}
