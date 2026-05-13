"use client";

import { useActionState } from "react";

import { signIn, signUp, type ListingActionState } from "@/app/actions";

const initialState: ListingActionState = {
  ok: false,
  message: ""
};

export function AuthForms() {
  const [signInState, signInAction] = useActionState(signIn, initialState);
  const [signUpState, signUpAction] = useActionState(signUp, initialState);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form action={signInAction} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink/65">Manage listings and edit your profile.</p>
        </div>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Email
          <input name="email" required type="email" className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Password
          <input name="password" required type="password" className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        {signInState.message ? (
          <p className={`rounded-md px-3 py-2 text-sm ${signInState.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
            {signInState.message}
          </p>
        ) : null}
        <button className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white">Sign in</button>
      </form>

      <form action={signUpAction} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-ink">Create account</h2>
          <p className="mt-1 text-sm text-ink/65">New sellers get a profile and owned listings.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-ink">
            First name
            <input name="firstName" required className="h-11 rounded-md border border-black/15 px-3" placeholder="Peter" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Last name
            <input name="lastName" required className="h-11 rounded-md border border-black/15 px-3" placeholder="Parker" />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Email
          <input name="email" required type="email" className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Password
          <input name="password" required minLength={6} type="password" className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        {signUpState.message ? (
          <p className={`rounded-md px-3 py-2 text-sm ${signUpState.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
            {signUpState.message}
          </p>
        ) : null}
        <button className="h-11 rounded-md bg-moss px-4 text-sm font-semibold text-white">Create account</button>
      </form>
    </div>
  );
}
