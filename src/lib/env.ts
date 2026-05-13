export function hasSupabaseEnv() {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      publishableKey &&
      !publishableKey.startsWith("replace-")
  );
}
