import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Avatar } from "@/components/huerta";
import { GardenGrid } from "@/components/garden-grid";
import { uploadPhoto } from "@/lib/photos";
import { useMe } from "@/lib/session";
import { useGardens } from "@/lib/gardens";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — Huerta Hoy" }, { name: "description", content: "Tu foto, usuario y diarios." }] }),
  component: Perfil,
});

function Perfil() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: gardens } = useGardens(me?.id);

  async function changeAvatar(f?: File) {
    if (!f || !me) return;
    try {
      const path = await uploadPhoto(f, me.id);
      const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", me.id);
      if (error) throw error;
      qc.invalidateQueries();
      toast.success("Foto actualizada.");
    } catch {
      toast.error("No se pudo subir la foto.");
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  const total = gardens?.reduce((n, g) => n + g.posts.length, 0) ?? 0;

  return (
    <AppShell
      title="Perfil"
      action={
        <button onClick={signOut} aria-label="Cerrar sesión" className="rounded-full p-2 hover:bg-muted">
          <LogOut className="h-5 w-5" />
        </button>
      }
    >
      {me && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl bg-forest p-6 text-cream shadow-soft">
          <label className="relative cursor-pointer">
            <Avatar path={me.avatar_path} name={me.username} size={96} />
            <span className="absolute bottom-0 right-0 rounded-full bg-terracotta p-2 text-cream">
              <Camera className="h-4 w-4" />
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => changeAvatar(e.target.files?.[0])} />
          </label>
          <h2 className="text-2xl font-semibold">@{me.username}</h2>
          <p className="text-sm opacity-80">
            {gardens?.length ?? 0} diarios · {total} fotos
          </p>
        </div>
      )}
      <h3 className="mb-3 text-lg font-semibold">Mis diarios</h3>
      <GardenGrid gardens={gardens ?? []} />
    </AppShell>
  );
}
