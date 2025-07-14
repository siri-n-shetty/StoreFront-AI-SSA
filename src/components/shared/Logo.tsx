import { Bot } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="StoreFront AI Home">
      <Bot className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        StoreFront AI
      </span>
    </Link>
  );
}
