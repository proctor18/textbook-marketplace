import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";

import { signOut } from "@/app/actions";

export function HeaderNav({ email, avatarUrl }: { email?: string | null; avatarUrl?: string | null }) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
        <BookOpen aria-hidden className="h-5 w-5 text-moss" />
        Textbook Market
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/" className="rounded-md px-3 py-2 font-medium text-ink/70 hover:bg-white">
          Browse
        </Link>
        {email ? (
          <>
            <Link href="/account/listings" className="rounded-md px-3 py-2 font-medium text-ink/70 hover:bg-white">
              My listings
            </Link>
            <Link href="/messages" className="rounded-md px-3 py-2 font-medium text-ink/70 hover:bg-white">
              Messages
            </Link>
            <Link href="/account/profile" className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium text-ink/70 hover:bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl ?? "/placeholder-avatar.svg"} alt="" className="h-6 w-6 rounded-full object-cover" />
              Profile
            </Link>
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-medium text-ink/70 hover:text-ink">
                <LogOut aria-hidden className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/auth" className="rounded-md bg-ink px-3 py-2 font-semibold text-white">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
