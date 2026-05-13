import Link from "next/link";
import { redirect } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*, marketplace_items(title, image_url)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const otherUserIds = Array.from(
    new Set((conversations ?? []).map((conversation) => (conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id)))
  );

  const { data: profiles } = otherUserIds.length
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", otherUserIds)
    : { data: [] };

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} />
      <header>
        <h1 className="text-3xl font-semibold text-ink">Messages</h1>
        <p className="mt-2 text-ink/70">Conversations about textbook listings.</p>
      </header>
      <section className="grid gap-3">
        {(conversations ?? []).length > 0 ? (
          conversations?.map((conversation) => {
            const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
            const profile = profilesById.get(otherUserId);
            const item = Array.isArray(conversation.marketplace_items)
              ? conversation.marketplace_items[0]
              : conversation.marketplace_items;

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-soft transition hover:border-moss/40 sm:grid-cols-[56px_1fr_auto] sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile?.avatar_url ?? "/placeholder-avatar.svg"} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <h2 className="font-semibold text-ink">{profile?.display_name ?? "Marketplace user"}</h2>
                  <p className="mt-1 text-sm text-ink/60">{item?.title ?? "Marketplace item"}</p>
                </div>
                <p className="text-sm text-ink/45">
                  {new Date(conversation.updated_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-black/20 bg-white p-8 text-center text-ink/65">
            You do not have any messages yet.
          </div>
        )}
      </section>
    </main>
  );
}
