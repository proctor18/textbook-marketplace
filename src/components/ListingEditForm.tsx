"use client";

import { useActionState } from "react";

import { deleteListing, updateListing, type ListingActionState } from "@/app/actions";
import type { Database } from "@/lib/database.types";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type Listing = Database["public"]["Tables"]["marketplace_items"]["Row"];

const initialState: ListingActionState = {
  ok: false,
  message: ""
};

export function ListingEditForm({ locations, listing }: { locations: Location[]; listing: Listing }) {
  const [state, formAction] = useActionState(updateListing, initialState);

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
        <input type="hidden" name="id" value={listing.id} />
        <input type="hidden" name="existingImageUrl" value={listing.image_url ?? ""} />
        <label className="grid gap-1 text-sm font-medium text-ink">
          Title
          <input name="title" required defaultValue={listing.title} className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Author
            <input name="author" defaultValue={listing.author ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            ISBN
            <input name="isbn" defaultValue={listing.isbn ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Course
            <input name="courseCode" defaultValue={listing.course_code ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Price
            <input name="price" required min="0" step="0.01" type="number" defaultValue={(listing.price_cents / 100).toFixed(2)} className="h-11 rounded-md border border-black/15 px-3" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Condition
            <select name="condition" required defaultValue={listing.condition} className="h-11 rounded-md border border-black/15 px-3">
              <option value="new">New</option>
              <option value="like_new">Like new</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="worn">Worn</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Status
            <select name="status" required defaultValue={listing.status} className="h-11 rounded-md border border-black/15 px-3">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium text-ink">
        Campus
          <select name="locationId" defaultValue={listing.location_id ?? ""} className="h-11 rounded-md border border-black/15 px-3">
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
          <textarea name="description" rows={5} defaultValue={listing.description ?? ""} className="rounded-md border border-black/15 px-3 py-2" />
        </label>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.image_url ?? "/placeholder-cover.svg"}
            alt=""
            className="aspect-[3/4] w-full rounded-md border border-black/10 object-cover"
          />
          <label className="grid gap-1 text-sm font-medium text-ink">
            Replace cover photo
            <input name="photo" type="file" accept="image/*" className="rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        {state.message ? (
          <p className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
            {state.message}
          </p>
        ) : null}
        <button className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white">Save listing</button>
      </form>
      <form action={deleteListing} className="rounded-lg border border-coral/20 bg-coral/10 p-4">
        <input type="hidden" name="id" value={listing.id} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-coral">Delete listing</h2>
            <p className="mt-1 text-sm text-ink/65">Remove this textbook from the marketplace.</p>
          </div>
          <button className="h-10 rounded-md bg-coral px-4 text-sm font-semibold text-white">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
