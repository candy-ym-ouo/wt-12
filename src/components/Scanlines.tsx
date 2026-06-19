export function Scanlines() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 right-0 h-8 animate-scanline"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(0, 255, 65, 0.08) 50%, transparent 100%)',
          }}
        />
      </div>
    </>
  );
}
