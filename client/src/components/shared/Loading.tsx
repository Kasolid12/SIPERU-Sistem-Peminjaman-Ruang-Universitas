export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary mx-auto mb-4" />
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    </div>
  );
}