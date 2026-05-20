'use client';

import { Search } from 'lucide-react';

/**
 * Visual ⌘K trigger in the header. Clicking dispatches a custom event
 * that the global CommandPalette (mounted in the root layout) listens for.
 */
export function CmdKHint() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('tw-open-search'))}
      className="hidden md:inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
      title="⌘K / Ctrl+K"
      aria-label="search"
      dir="ltr"
    >
      <Search className="size-3" />
      ⌘K
    </button>
  );
}
