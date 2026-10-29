import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/huerta";
import { GardenGrid } from "@/components/garden-grid";
import { useMe } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({ meta: [{ title: "Mi diario — Huerta Hoy" }, { name: "description", content: "Tus huertas y plantas." }] }),
  component: Diario,
});

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

function Diario() {
  const me = useMe();
  const { data } = useGardens(me?.id);
  return (
    <AppShell
      title="Mi diario"
      action={
        <Link to="/nueva" aria-label="Nueva entrada" className="rounded-full bg-primary p-2 text-primary-foreground">
          <Plus className="h-5 w-5" />
        </Link>
      }
    >
      {data && data.length === 0 ? (
        <div className="rounded-3xl bg-card p-8 text-center shadow-soft">
          <p className="font-display text-xl">Tu diario está vacío.</p>
          <p className="mt-1 text-sm text-muted-foreground">Subí tu primera foto para empezar una huerta o planta.</p>
          <Link to="/nueva" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground">
            Nueva entrada
          </Link>
        </div>
      ) : (
        <GardenGrid gardens={data ?? []} />
      )}
    </AppShell>
  );
}
