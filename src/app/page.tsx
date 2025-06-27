import { supabase } from "./utils/supabaseClient";

export default async function Home() {
  const { data } = await supabase.from('Players').select('*');
  console.log(data)
  return (
    <div>
      home 
    </div>
  );
}
