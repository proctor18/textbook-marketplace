import { redirect } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { createClient, getUserOrNull } from "@/lib/supabase/server";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const user = await getUserOrNull(supabase);

  if (!user) {
    redirect("/auth/reset-password");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav email={user.email} />
      <UpdatePasswordForm />
    </main>
  );
}
