"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type ListingCondition = Database["public"]["Enums"]["listing_condition"];
type ListingStatus = Database["public"]["Enums"]["listing_status"];

const validConditions = new Set<ListingCondition>([
  "new",
  "like_new",
  "good",
  "fair",
  "worn"
]);

export type ListingActionState = {
  ok: boolean;
  message: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isRateLimitError(message: string) {
  return message.toLowerCase().includes("rate limit");
}

function optionalString(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

async function uploadListingPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  value: FormDataEntryValue | null,
  bucket = "marketplace-item-photos"
) {
  if (!(value instanceof File) || value.size === 0) {
    return { url: null, error: null };
  }

  if (!value.type.startsWith("image/")) {
    return { url: null, error: "Upload an image file." };
  }

  if (value.size > 5 * 1024 * 1024) {
    return { url: null, error: "Photos must be 5 MB or smaller." };
  }

  const extension = value.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${randomUUID()}.${extension}`;
  let uploadResult;

  try {
    uploadResult = await supabase.storage.from(bucket).upload(path, value, {
      cacheControl: "31536000",
      upsert: false
    });
  } catch (error) {
    return { url: null, error: getErrorMessage(error) };
  }

  const { error } = uploadResult;

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function createListing(
  _previousState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "Add Supabase environment variables before creating listings."
    };
  }

  const title = optionalString(formData.get("title"));
  const rawPrice = optionalString(formData.get("price"));
  const condition = optionalString(formData.get("condition")) as ListingCondition | null;

  if (!title || !rawPrice || !condition) {
    return { ok: false, message: "Fill in title, price, and condition." };
  }

  const price = Number.parseFloat(rawPrice);

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Enter a valid price." };
  }

  if (!validConditions.has(condition)) {
    return { ok: false, message: "Choose a valid book condition." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { ok: false, message: "Sign in before creating a listing." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const uploadedPhoto = await uploadListingPhoto(supabase, user.id, formData.get("photo"));

    if (uploadedPhoto.error) {
      return { ok: false, message: uploadedPhoto.error };
    }

    const { error } = await supabase.from("marketplace_items").insert({
      user_id: user.id,
      title,
      author: optionalString(formData.get("author")),
      isbn: optionalString(formData.get("isbn")),
      course_code: optionalString(formData.get("courseCode"))?.toUpperCase() ?? null,
      location_id: optionalString(formData.get("locationId")) ?? optionalString(formData.get("campusId")),
      price_cents: Math.round(price * 100),
      condition,
      description: optionalString(formData.get("description")),
      seller_name: profile?.display_name ?? user.email.split("@")[0],
      seller_email: user.email,
      image_url: uploadedPhoto.url
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/");
    revalidatePath("/account/listings");
    return { ok: true, message: "Listing posted. It is live on the marketplace." };
  } catch (error) {
    return {
      ok: false,
      message: `Could not post listing: ${getErrorMessage(error)}`
    };
  }
}

export async function signIn(_previousState: ListingActionState, formData: FormData) {
  const email = optionalString(formData.get("email"));
  const password = optionalString(formData.get("password"));

  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false,
      message: isRateLimitError(error.message)
        ? "Email sending is temporarily rate limited. Wait a few minutes and try again."
        : error.message
    };
  }

  redirect("/account/listings");
}

export async function signUp(_previousState: ListingActionState, formData: FormData) {
  const email = optionalString(formData.get("email"));
  const password = optionalString(formData.get("password"));
  const confirmPassword = optionalString(formData.get("confirmPassword"));
  const firstName = optionalString(formData.get("firstName"));
  const lastName = optionalString(formData.get("lastName"));

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { ok: false, message: "Enter your first name, last name, email, password, and confirmed password." };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Account created. Check your email to confirm your account before signing in." };
}

export async function requestPasswordReset(_previousState: ListingActionState, formData: FormData) {
  const email = optionalString(formData.get("email"));

  if (!email) {
    return { ok: false, message: "Enter your email address." };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Password reset email sent. Check your inbox for the reset link." };
}

export async function updatePassword(_previousState: ListingActionState, formData: FormData) {
  const password = optionalString(formData.get("password"));

  if (!password || password.length < 6) {
    return { ok: false, message: "Enter a new password with at least 6 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Password updated. You can use your new password now." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_previousState: ListingActionState, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const uploadedAvatar = await uploadListingPhoto(
    supabase,
    user.id,
    formData.get("avatar"),
    "profile-photos"
  );

  if (uploadedAvatar.error) {
    return { ok: false, message: uploadedAvatar.error };
  }

  const firstName = optionalString(formData.get("firstName"));
  const lastName = optionalString(formData.get("lastName"));

  if (!firstName || !lastName) {
    return { ok: false, message: "First and last name are required." };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    display_name: `${firstName} ${lastName}`,
    location_id: optionalString(formData.get("locationId")) ?? optionalString(formData.get("campusId")),
    phone: optionalString(formData.get("phone")),
    bio: optionalString(formData.get("bio")),
    avatar_url: uploadedAvatar.url ?? optionalString(formData.get("existingAvatarUrl"))
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/account/profile");
  revalidatePath("/");
  return { ok: true, message: "Profile updated." };
}

export async function updateListing(_previousState: ListingActionState, formData: FormData) {
  const id = optionalString(formData.get("id"));
  const title = optionalString(formData.get("title"));
  const rawPrice = optionalString(formData.get("price"));
  const condition = optionalString(formData.get("condition")) as ListingCondition | null;
  const status = optionalString(formData.get("status")) as ListingStatus | null;

  if (!id || !title || !rawPrice || !condition || !status) {
    return { ok: false, message: "Fill in title, price, condition, and status." };
  }

  const price = Number.parseFloat(rawPrice);

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Enter a valid price." };
  }

  if (!validConditions.has(condition)) {
    return { ok: false, message: "Choose a valid book condition." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const uploadedPhoto = await uploadListingPhoto(supabase, user.id, formData.get("photo"));

  if (uploadedPhoto.error) {
    return { ok: false, message: uploadedPhoto.error };
  }

  const { error } = await supabase
    .from("marketplace_items")
    .update({
      title,
      author: optionalString(formData.get("author")),
      isbn: optionalString(formData.get("isbn")),
      course_code: optionalString(formData.get("courseCode"))?.toUpperCase() ?? null,
      location_id: optionalString(formData.get("locationId")) ?? optionalString(formData.get("campusId")),
      price_cents: Math.round(price * 100),
      condition,
      status,
      description: optionalString(formData.get("description")),
      image_url: uploadedPhoto.url ?? optionalString(formData.get("existingImageUrl"))
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${id}`);
  revalidatePath(`/listings/${id}/edit`);
  revalidatePath("/account/listings");
  return { ok: true, message: "Listing updated." };
}

export async function startConversation(formData: FormData) {
  const itemId = optionalString(formData.get("itemId"));

  if (!itemId) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: item, error: itemError } = await supabase
    .from("marketplace_items")
    .select("id, user_id, status")
    .eq("id", itemId)
    .eq("status", "active")
    .maybeSingle();

  if (itemError || !item?.user_id) {
    redirect(`/listings/${itemId}`);
  }

  if (item.user_id === user.id) {
    redirect(`/listings/${itemId}`);
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("item_id", item.id)
    .eq("buyer_id", user.id)
    .eq("seller_id", item.user_id)
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      item_id: item.id,
      buyer_id: user.id,
      seller_id: item.user_id
    })
    .select("id")
    .single();

  if (error || !conversation) {
    redirect(`/listings/${itemId}`);
  }

  redirect(`/messages/${conversation.id}`);
}

export async function sendMessage(_previousState: ListingActionState, formData: FormData) {
  const conversationId = optionalString(formData.get("conversationId"));
  const body = optionalString(formData.get("body"));

  if (!conversationId || !body) {
    return { ok: false, message: "Write a message before sending." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, message: "" };
}

export async function deleteListing(formData: FormData) {
  const id = optionalString(formData.get("id"));

  if (!id) {
    redirect("/account/listings");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  await supabase.from("marketplace_items").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/account/listings");
  redirect("/account/listings");
}
