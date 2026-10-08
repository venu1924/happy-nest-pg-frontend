import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-nest-muted">
      <Loader2 className="h-6 w-6 animate-spin text-nest-navy" aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  );
}
