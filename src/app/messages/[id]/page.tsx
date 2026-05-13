import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { MessageThread } from "@/components/MessageThread";
import { createClient, getUserOrNull } from "@/lib/supabase/server";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUserOrNull(supabase);

  if (!user) {
    redirect("/auth");
  }

  const [{ data: conversation, error }, { data: messages, error: messagesError }] = await Promise.all([
    supabase
      .from("conversations")
      .select("*, marketplace_items(title, image_url)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true })
  ]);

  if (error || messagesError) {
    throw new Error(error?.message ?? messagesError?.message);
  }

  if (!conversation) {
    notFound();
  }

  const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", otherUserId)
    .maybeSingle();

  const item = Array.isArray(conversation.marketplace_items)
    ? conversation.marketplace_items[0]
    : conversation.marketplace_items;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} />
      <header className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-soft sm:grid-cols-[56px_1fr_auto] sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile?.avatar_url ?? "/placeholder-avatar.svg"} alt="" className="h-14 w-14 rounded-full object-cover" />
        <div>
          <h1 className="text-xl font-semibold text-ink">{profile?.display_name ?? "Marketplace user"}</h1>
          <p className="mt-1 text-sm text-ink/60">{item?.title ?? "Marketplace item"}</p>
        </div>
        {conversation.item_id ? (
          <Link href={`/listings/${conversation.item_id}`} className="rounded-md bg-black/5 px-3 py-2 text-sm font-medium text-ink">
            View listing
          </Link>
        ) : null}
      </header>
      <MessageThread conversationId={conversation.id} currentUserId={user.id} initialMessages={messages ?? []} />
    </main>
  );
}
