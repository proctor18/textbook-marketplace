"use client";

import { useActionState } from "react";

import { updateProfile, type ListingActionState } from "@/app/actions";
import type { Database } from "@/lib/database.types";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const initialState: ListingActionState = {
  ok: false,
  message: ""
};

export function ProfileForm({ locations, profile }: { locations: Location[]; profile: Profile | null }) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <input type="hidden" name="existingAvatarUrl" value={profile?.avatar_url ?? ""} />
      <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile?.avatar_url ?? "/placeholder-avatar.svg"}
          alt=""
          className="aspect-square w-full rounded-full border border-black/10 object-cover"
        />
        <label className="grid gap-1 text-sm font-medium text-ink">
          Profile photo
          <input name="avatar" type="file" accept="image/*" className="rounded-md border border-black/15 bg-white px-3 py-2 text-sm" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-ink">
          First name
          <input name="firstName" required defaultValue={profile?.first_name ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Last name
          <input name="lastName" required defaultValue={profile?.last_name ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-ink">
        Campus
        <select name="locationId" defaultValue={profile?.location_id ?? ""} className="h-11 rounded-md border border-black/15 px-3">
          <option value="">Any campus</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink">
        Phone
        <input name="phone" defaultValue={profile?.phone ?? ""} className="h-11 rounded-md border border-black/15 px-3" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink">
        Bio
        <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} className="rounded-md border border-black/15 px-3 py-2" />
      </label>
      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-moss/10 text-moss" : "bg-coral/10 text-coral"}`}>
          {state.message}
        </p>
      ) : null}
      <button className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white">Save profile</button>
    </form>
  );
}
