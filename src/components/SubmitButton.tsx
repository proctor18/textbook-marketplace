"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus aria-hidden className="h-4 w-4" />
      {pending ? "Posting..." : "Post listing"}
    </button>
  );
}
