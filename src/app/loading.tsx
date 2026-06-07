export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-sky/20" />
          <div className="absolute inset-0 rounded-full border-2 border-sky border-t-transparent animate-spin" />
        </div>
        <p className="text-[12px] text-text-muted font-medium">Loading…</p>
      </div>
    </div>
  );
}
