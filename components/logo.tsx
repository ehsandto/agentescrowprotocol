export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="4" fill="#e24b2a" />
      <path d="M8 21.5V10.5h3.2l4.8 7.1 4.8-7.1H24v11" fill="none" stroke="#12100c" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}
