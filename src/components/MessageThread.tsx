"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";

import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type Message = Database["public"]["Tables"]["messages"]["Row"];

function sortMessages(messages: Message[]) {
  return [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function addMessage(current: Message[], nextMessage: Message) {
  return current.some((message) => message.id === nextMessage.id)
    ? current
    : sortMessages([...current, nextMessage]);
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(() => sortMessages(initialMessages));
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const nextMessage = payload.new as Message;
          setMessages((current) => addMessage(current, nextMessage));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const body = String(formData.get("body") ?? "").trim();

    if (!body || isSending) {
      return;
    }

    setError("");
    setIsSending(true);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body
      })
      .select("*")
      .single();

    setIsSending(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Message could not be sent.");
      return;
    }

    formRef.current?.reset();
    setMessages((current) => addMessage(current, data));
  }

  return (
    <section className="grid min-h-[620px] grid-rows-[1fr_auto] rounded-lg border border-black/10 bg-white shadow-soft">
      <div className="grid content-start gap-3 overflow-y-auto p-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;

            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm leading-6 ${isMine ? "bg-ink text-white" : "bg-black/5 text-ink"}`}>
                  <p>{message.body}</p>
                  <p className={`mt-1 text-[11px] ${isMine ? "text-white/55" : "text-ink/45"}`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-black/20 p-8 text-center text-sm text-ink/60">
            Start the conversation.
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-2 border-t border-black/10 p-3 sm:grid-cols-[1fr_auto]"
      >
        <label className="sr-only" htmlFor="message-body">
          Message
        </label>
        <textarea
          id="message-body"
          name="body"
          required
          rows={2}
          className="resize-none rounded-md border border-black/15 px-3 py-2 text-sm"
          placeholder="Write a message..."
        />
        <button
          disabled={isSending}
          className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-moss px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send aria-hidden className="h-4 w-4" />
          {isSending ? "Sending" : "Send"}
        </button>
        {error ? <p className="text-sm text-coral sm:col-span-2">{error}</p> : null}
      </form>
    </section>
  );
}
