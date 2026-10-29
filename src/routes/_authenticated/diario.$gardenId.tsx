import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Photo, formatDate } from "@/components/huerta";

export const Route = createFileRoute("/_authenticated/diario/$gardenId")({
  head: () => ({ meta: [{ title: "Línea de tiempo — Huerta Hoy" }, { name: "description", content: "Fotos de una huerta o planta a lo largo del tiempo." }] }),
  component: Timeline,
});

function Timeline() {
  const { gardenId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["garden", gardenId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gardens")
        .select("id, name, kind, posts(id, image_path, body, taken_on)")
        .eq("id", gardenId)
        .single();
      if (error) throw error;
      return data;
    },
  });
  const posts = [...(data?.posts ?? [])].sort((a, b) => b.taken_on.localeCompare(a.taken_on));
  return (
    <AppShell
      title={data?.name ?? "…"}
      action={
        <Link to="/diario" aria-label="Volver" className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {data?.kind === "planta" ? "Planta" : "Huerta"} · {posts.length} fotos
      </p>
      <ol className="relative space-y-8 border-l-2 border-dashed border-soil/40 pl-6">
        {posts.map((p) => (
          <li key={p.id} className="relative">
            <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-background bg-terracotta" />
            <p className="mb-2 text-sm font-semibold text-soil">{formatDate(p.taken_on)}</p>
            <Link to="/post/$id" params={{ id: p.id }} className="block overflow-hidden rounded-3xl bg-card shadow-soft">
              <Photo path={p.image_path} alt={p.body} className="aspect-square w-full" />
              <p className="p-4 text-sm">{p.body}</p>
            </Link>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
