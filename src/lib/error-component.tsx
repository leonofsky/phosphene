import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "AN UNEXPECTED ERROR OCCURRED. TRY RELOADING THE PAGE.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.toUpperCase();
  if (typeof error === "string" && error) return error.toUpperCase();
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-void px-6 text-center font-mono uppercase tracking-[0.14em] text-ink">
      <span className="text-phosphor" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-medium tracking-[-0.06em]">SOMETHING WENT WRONG</h1>
      <p className="max-w-md text-[10px] break-words text-muted">{errorMessage(error)}</p>
    </main>
  );
}
