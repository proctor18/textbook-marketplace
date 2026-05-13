import Link from "next/link";
import { BookOpen, Search, SlidersHorizontal } from "lucide-react";

import { HeaderNav } from "@/components/HeaderNav";
import type { Database } from "@/lib/database.types";
import { hasSupabaseEnv } from "@/lib/env";
import { formatCondition, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type Listing = Database["public"]["Tables"]["marketplace_items"]["Row"] & {
  locations: Pick<Location, "name"> | null;
};

const sampleLocations: Location[] = [
  {
    id: "sample-macewan",
    name: "MacEwan University",
    city: "Edmonton",
    region: "AB",
    created_at: new Date().toISOString()
  },
  {
    id: "sample-uofa",
    name: "University of Alberta",
    city: "Edmonton",
    region: "AB",
    created_at: new Date().toISOString()
  }
];

const sampleListings: Listing[] = [
  {
    id: "sample-1",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "9781285741550",
    course_code: "MATH 265",
    location_id: sampleLocations[0].id,
    price_cents: 5200,
    condition: "good",
    description: "Clean copy with a few pencil notes in chapter 4.",
    seller_name: "Maya",
    seller_email: "maya@example.com",
    status: "active",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: null,
    locations: { name: "MacEwan University" }
  },
  {
    id: "sample-2",
    title: "They Say / I Say",
    author: "Graff and Birkenstein",
    isbn: "9780393935844",
    course_code: "ENGL 201",
    location_id: sampleLocations[1].id,
    price_cents: 1800,
    condition: "like_new",
    description: "Barely used. No highlighting.",
    seller_name: "Noah",
    seller_email: "noah@example.com",
    status: "active",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: null,
    locations: { name: "University of Alberta" }
  }
];

function getCoverColor(index: number) {
  const colors = ["bg-moss", "bg-coral", "bg-gold", "bg-ink"];
  return colors[index % colors.length];
}

function getSampleMarketplaceData(query: string, locationId: string, connectionError: string | null) {
  const normalizedQuery = query.toLowerCase();
  const listings = sampleListings.filter((listing) => {
    const matchesQuery =
      !normalizedQuery ||
      [listing.title, listing.author, listing.isbn, listing.course_code]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    const matchesLocation = !locationId || listing.location_id === locationId;
    return matchesQuery && matchesLocation;
  });

  return {
    locations: sampleLocations,
    listings,
    isConfigured: false,
    userEmail: null,
    connectionError
  };
}

async function getMarketplaceData(query: string, locationId: string) {
  if (!hasSupabaseEnv()) {
    return getSampleMarketplaceData(query, locationId, null);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const [{ data: locations, error: locationError }, listingsResponse] = await Promise.all([
      supabase.from("locations").select("*").order("name"),
      supabase
        .from("marketplace_items")
        .select("*, locations(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
    ]);

    if (locationError) {
      throw new Error(locationError.message);
    }

    let listings = listingsResponse.data ?? [];

    if (listingsResponse.error) {
      throw new Error(listingsResponse.error.message);
    }

    if (locationId) {
      listings = listings.filter((listing) => listing.location_id === locationId);
    }

    if (query) {
      const normalizedQuery = query.toLowerCase();
      listings = listings.filter((listing) =>
        [listing.title, listing.author, listing.isbn, listing.course_code]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery))
      );
    }

    return {
      locations: locations ?? [],
      listings: listings as Listing[],
      isConfigured: true,
      userEmail: user?.email ?? null,
      connectionError: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach Supabase.";
    return getSampleMarketplaceData(query, locationId, message);
  }
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ q?: string; location?: string; campus?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const locationId = params.location?.trim() ?? params.campus?.trim() ?? "";
  const { locations, listings, isConfigured, userEmail, connectionError } = await getMarketplaceData(query, locationId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={userEmail} />
      <header className="grid gap-6 border-b border-black/10 pb-6 lg:grid-cols-[1fr_380px] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1 text-sm font-medium text-moss">
            <BookOpen aria-hidden className="h-4 w-4" />
            Campus textbook exchange
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Find the book you need before the first lecture.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
            Search by title, ISBN, author, or course code. Listings connect students through realtime messaging.
          </p>
        </div>

        <form className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-soft" action="/">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Search
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
              <input
                name="q"
                defaultValue={query}
                className="h-11 w-full rounded-md border border-black/15 pl-9 pr-3"
                placeholder="ISBN, course, title..."
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Campus
            <select name="location" defaultValue={locationId} className="h-11 rounded-md border border-black/15 px-3">
              <option value="">All campuses</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-moss/90">
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Apply filters
          </button>
        </form>
      </header>

      {!isConfigured ? (
        <section className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          {connectionError ? (
            <>
              Supabase could not be reached: <span className="font-semibold">{connectionError}</span>. Showing preview data for now.
            </>
          ) : (
            <>
              Supabase is not connected yet. Add values to <code className="font-semibold">.env.local</code>, run the migrations,
              and this preview data will be replaced by your database.
            </>
          )}
        </section>
      ) : null}

      <section className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Available textbooks</h2>
            <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-ink/70">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </span>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-4">
              {listings.map((listing, index) => (
                <article key={listing.id} className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-soft sm:grid-cols-[116px_1fr]">
                  <div className={`flex aspect-[3/4] items-center justify-center rounded-md ${getCoverColor(index)} text-white`}>
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.image_url} alt="" className="h-full w-full rounded-md object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/placeholder-cover.svg" alt="" className="h-full w-full rounded-md object-cover" />
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-ink">
                          <Link href={`/listings/${listing.id}`} className="hover:text-moss">
                            {listing.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-ink/60">
                          {[listing.author, listing.course_code, listing.isbn].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      <p className="rounded-md bg-ink px-3 py-1 text-sm font-semibold text-white">
                        {formatPrice(listing.price_cents)}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-ink/70">
                      {listing.description ?? "Seller did not add notes for this copy."}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-ink/65">
                      <span className="rounded-md bg-moss/10 px-2 py-1 text-moss">{formatCondition(listing.condition)}</span>
                      <span className="rounded-md bg-black/5 px-2 py-1">{listing.locations?.name ?? "Any campus"}</span>
                      <Link href={`/listings/${listing.id}`} className="rounded-md bg-black/5 px-2 py-1 font-medium text-ink">
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-black/20 bg-white p-8 text-center text-ink/65">
              No listings match those filters yet.
            </div>
          )}
      </section>
    </main>
  );
}
