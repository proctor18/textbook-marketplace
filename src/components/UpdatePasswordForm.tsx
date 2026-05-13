"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updatePassword, type ListingActionState } from "@/app/actions";

const initialState: ListingActionState = {
  ok: false,
  message: ""
};

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialState);

  return (
    <form noValidate action={formAction} className="grid max-w-xl gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Enter a new password for your marketplace account.
        </p>
      </div>

      <label className="grid gap-1 text-sm font-medium text-ink">
        New password
        <input name="password" required minLength={6} type="password" className="h-11 rounded-md border border-black/15 px-3" />
      </label>

      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/auth" className="text-sm font-medium text-ink/65 hover:text-ink">
          Back to sign in
        </Link>
        <button type="submit" className="h-11 rounded-md bg-moss px-4 text-sm font-semibold text-white">Update password</button>
      </div>
    </form>
  );
}
