interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-100/85 backdrop-blur-md relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-imperial-300 to-transparent" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
        >
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <rect width="32" height="32" rx="8" fill="#5B2A83" />
            <path d="M8 22V13.5C8 12.6716 8.67157 12 9.5 12H10.5C11.3284 12 12 12.6716 12 13.5V22" stroke="#EFC75E" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14 22V10.5C14 9.67157 14.6716 9 15.5 9H16.5C17.3284 9 18 9.67157 18 10.5V22" stroke="#EFC75E" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M20 22V13.5C20 12.6716 20.6716 12 21.5 12H22.5C23.3284 12 24 12.6716 24 13.5V22" stroke="#EFC75E" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6 22H26" stroke="#EFC75E" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Coliseo
          </span>
        </button>
      </div>
    </header>
  );
}
