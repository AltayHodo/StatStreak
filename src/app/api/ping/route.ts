import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // or anon key if you keep it simple
);

export async function GET() {
  await supabase.from("users").select("id").limit(1); // tiny query
  return new Response("ok");
}
