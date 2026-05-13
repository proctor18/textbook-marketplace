import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { startConversation } from "@/app/actions";
import { HeaderNav } from "@/components/HeaderNav";
import { formatCondition, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("marketplace_items")
    .select("*, locations(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!listing || (listing.status !== "active" && listing.user_id !== user?.id)) {
    notFound();
  }

  const isOwner = listing.user_id === user?.id;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user?.email} />
      <article className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-soft md:grid-cols-[220px_1fr]">
        <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-moss text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.image_url ?? "/placeholder-cover.svg"} alt="" className="h-full w-full rounded-md object-cover" />
        </div>
        <div className="grid gap-5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-semibold text-ink">{listing.title}</h1>
              <span className="rounded-md bg-ink px-3 py-1 text-sm font-semibold text-white">{formatPrice(listing.price_cents)}</span>
            </div>
            <p className="mt-2 text-ink/60">
              {[listing.author, listing.course_code, listing.isbn].filter(Boolean).join(" | ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md bg-moss/10 px-2 py-1 text-moss">{formatCondition(listing.condition)}</span>
            <span className="rounded-md bg-black/5 px-2 py-1">{listing.locations?.name ?? "Any campus"}</span>
            {isOwner ? <span className="rounded-md bg-gold/20 px-2 py-1 text-ink">You own this listing</span> : null}
          </div>
          <p className="leading-7 text-ink/75">{listing.description ?? "The seller did not add extra notes for this copy."}</p>
          <div className="flex flex-wrap gap-3">
            {isOwner ? (
              <Link href={`/listings/${listing.id}/edit`} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
                Edit listing
              </Link>
            ) : user ? (
              <form action={startConversation}>
                <input type="hidden" name="itemId" value={listing.id} />
                <button className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white">
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  Message seller
                </button>
              </form>
            ) : (
              <Link href="/auth" className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white">
                <MessageCircle aria-hidden className="h-4 w-4" />
                Sign in to message
              </Link>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
