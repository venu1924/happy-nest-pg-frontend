export default function EmptyState({ title = 'Nothing here', description }) {
  return (
    <div className="rounded-2xl border border-dashed border-nest-line bg-white px-4 py-12 text-center">
      <p className="font-medium text-nest-navy">{title}</p>
      {description && <p className="mt-1 text-sm text-nest-muted">{description}</p>}
    </div>
  );
}
