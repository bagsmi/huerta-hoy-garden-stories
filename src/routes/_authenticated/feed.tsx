import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PostCard } from "@/components/huerta";
import { POST_SELECT, type FeedPost } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Inicio — Huerta Hoy" }, { name: "description", content: "Lo último de las huertas de la comunidad." }] }),
  component: Feed,
});

function Feed() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as unknown as FeedPost[];
    },
  });
  return (
    <AppShell title="Huerta Hoy">
      <div className="space-y-6">
        {isLoading && <div className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />}
        {data?.length === 0 && (
          <div className="rounded-3xl bg-card p-8 text-center shadow-soft">
            <p className="font-display text-xl">Todavía no hay nada sembrado acá.</p>
            <Link to="/nueva" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground">
              Hacé la primera publicación
            </Link>
          </div>
        )}
        {data?.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </AppShell>
  );
}
