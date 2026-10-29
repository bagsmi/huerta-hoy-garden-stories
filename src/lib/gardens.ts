import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGardens(userId?: string) {
  return useQuery({
    queryKey: ["gardens", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gardens")
        .select("id, name, kind, posts(image_path, taken_on)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
