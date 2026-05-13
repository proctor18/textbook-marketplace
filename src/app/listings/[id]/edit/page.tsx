import { notFound, redirect } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { ListingEditForm } from "@/components/ListingEditForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: locations }, { data: listing, error }] = await Promise.all([
    supabase.from("locations").select("*").order("name"),
    supabase.from("marketplace_items").select("*").eq("id", id).eq("user_id", user.id).maybeSingle()
  ]);

  if (error) {
    throw new Error(error.message);
  }

  if (!listing) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} />
      <header>
        <h1 className="text-3xl font-semibold text-ink">Edit listing</h1>
        <p className="mt-2 text-ink/70">Only the owner of this textbook listing can make changes.</p>
      </header>
      <ListingEditForm locations={locations ?? []} listing={listing} />
    </main>
  );
}
