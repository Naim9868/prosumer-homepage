"use client";

import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this product. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-foreground px-6 py-2 text-background transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
