import { redirect } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { ProfileForm } from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: locations }, { data: profile }] = await Promise.all([
    supabase.from("locations").select("*").order("name"),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} avatarUrl={profile?.avatar_url} />
      <header>
        <h1 className="text-3xl font-semibold text-ink">Profile</h1>
        <p className="mt-2 text-ink/70">Update the basic seller information attached to your listings.</p>
      </header>
      <ProfileForm locations={locations ?? []} profile={profile ?? null} />
    </main>
  );
}
