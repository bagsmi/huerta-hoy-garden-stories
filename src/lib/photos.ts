import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const exts: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = exts[file.type];
  if (!ext) throw new Error("Solo se permiten fotos JPG, PNG o WEBP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("La foto no puede pesar más de 5 MB.");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export function usePhotoUrl(path?: string | null | undefined) {
  return useQuery({
    queryKey: ["photo", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("photos").createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  }).data;
}
