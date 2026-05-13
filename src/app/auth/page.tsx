import { redirect } from "next/navigation";

import { AuthForms } from "@/components/AuthForms";
import { HeaderNav } from "@/components/HeaderNav";
import { createClient, getUserOrNull } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const user = await getUserOrNull(supabase);

  if (user) {
    redirect("/account/listings");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav />
      <header>
        <h1 className="text-3xl font-semibold text-ink">Your marketplace account</h1>
        <p className="mt-2 text-ink/70">Sign in or create an account to post and manage textbook listings.</p>
      </header>
      <AuthForms />
    </main>
  );
}
