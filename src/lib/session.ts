import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      return profile;
    },
  }).data;
}

export type FeedPost = {
  id: string;
  user_id: string;
  type: string;
  image_path: string;
  body: string;
  plant_name: string | null;
  taken_on: string;
  created_at: string;
  garden_id: string | null;
  profiles: { username: string; avatar_path: string | null } | null;
  gardens: { name: string; kind: string } | null;
  likes: { user_id: string }[];
  comments: { count: number }[];
};

export const POST_SELECT =
  "*, profiles(username, avatar_path), gardens(name, kind), likes(user_id), comments(count)";
