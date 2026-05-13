import { HeaderNav } from "@/components/HeaderNav";
import { PasswordResetRequestForm } from "@/components/PasswordResetRequestForm";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderNav />
      <PasswordResetRequestForm />
    </main>
  );
}
