import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteListing } from "@/app/actions";
import { HeaderNav } from "@/components/HeaderNav";
import { ListingForm } from "@/components/ListingForm";
import { formatCondition, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: locations, error: locationsError }, { data: listings, error }] = await Promise.all([
    supabase.from("locations").select("*").order("name"),
    supabase
      .from("marketplace_items")
      .select("*, locations(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  if (locationsError || error) {
    throw new Error(locationsError?.message ?? error?.message);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">My listings</h1>
          <p className="mt-2 text-ink/70">View, edit, and track every textbook you have posted.</p>
        </div>
        <Link href="/" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
          Browse textbooks
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <ListingForm locations={locations ?? []} isSignedIn={true} />

        <div className="grid gap-3">
          {(listings ?? []).length > 0 ? (
            listings?.map((listing) => (
              <article key={listing.id} className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-soft">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{listing.title}</h2>
                  <p className="mt-1 text-sm text-ink/60">
                    {[listing.course_code, listing.locations?.name, formatCondition(listing.condition), listing.status].filter(Boolean).join(" | ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-ink px-3 py-1 text-sm font-semibold text-white">{formatPrice(listing.price_cents)}</span>
                  <Link href={`/listings/${listing.id}`} className="rounded-md bg-black/5 px-3 py-2 text-sm font-medium text-ink">
                    View
                  </Link>
                  <Link href={`/listings/${listing.id}/edit`} className="rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white">
                    Edit
                  </Link>
                  <form action={deleteListing}>
                    <input type="hidden" name="id" value={listing.id} />
                    <button className="rounded-md bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-black/20 bg-white p-8 text-center text-ink/65">
              You have not posted any listings yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
