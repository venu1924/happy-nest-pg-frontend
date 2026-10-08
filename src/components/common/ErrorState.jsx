import { AlertCircle } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-12 text-center">
      <AlertCircle className="h-6 w-6 text-red-500" aria-hidden />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-nest-navy shadow-soft"
        >
          Try again
        </button>
      )}
    </div>
  );
}
