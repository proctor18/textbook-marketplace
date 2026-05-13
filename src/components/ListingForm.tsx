"use client";

import { useActionState } from "react";

import { createListing, type ListingActionState } from "@/app/actions";
import type { Database } from "@/lib/database.types";
import { SubmitButton } from "@/components/SubmitButton";

type Location = Database["public"]["Tables"]["locations"]["Row"];

const initialState: ListingActionState = {
  ok: false,
  message: ""
};

export function ListingForm({ locations, isSignedIn }: { locations: Location[]; isSignedIn: boolean }) {
  const [state, formAction] = useActionState(createListing, initialState);

  if (!isSignedIn) {
    return (
      <aside className="grid gap-3 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Sell a textbook</h2>
        <p className="text-sm leading-6 text-ink/65">
          Sign in to post listings, manage your books, and keep your seller profile up to date.
        </p>
        <a
          href="/auth"
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          Sign in to sell
        </a>
      </aside>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-lg font-semibold text-ink">Sell a textbook</h2>
        <p className="mt-1 text-sm text-ink/65">Create a live listing in under a minute.</p>
      </div>

      <label className="grid gap-1 text-sm font-medium text-ink">
        Title
        <input name="title" required className="h-11 rounded-md border border-black/15 px-3" placeholder="Campbell Biology" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-ink">
          Author
          <input name="author" className="h-11 rounded-md border border-black/15 px-3" placeholder="Urry et al." />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          ISBN
          <input name="isbn" className="h-11 rounded-md border border-black/15 px-3" placeholder="9780134093413" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium text-ink">
          Course
          <input name="courseCode" className="h-11 rounded-md border border-black/15 px-3" placeholder="BIOL 241" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Price
          <input name="price" required min="0" step="0.01" type="number" className="h-11 rounded-md border border-black/15 px-3" placeholder="45" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Condition
          <select name="condition" required defaultValue="good" className="h-11 rounded-md border border-black/15 px-3">
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="worn">Worn</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-medium text-ink">
        Campus
        <select name="locationId" className="h-11 rounded-md border border-black/15 px-3" defaultValue="">
          <option value="">Any campus</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-medium text-ink">
        Description
        <textarea name="description" rows={4} className="rounded-md border border-black/15 px-3 py-2" placeholder="Notes, access codes, highlighting, pickup details..." />
      </label>

      <label className="grid gap-1 text-sm font-medium text-ink">
        Cover photo
        <input name="photo" type="file" accept="image/*" className="rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
      </label>

      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
