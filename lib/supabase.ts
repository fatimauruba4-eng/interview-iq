import { createClient } from "@supabase/supabase-js";

const supabaseurl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseanonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  supabaseurl,
  supabaseanonkey
);

export default supabase;