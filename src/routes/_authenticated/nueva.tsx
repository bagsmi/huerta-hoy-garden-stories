import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/huerta";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadPhoto } from "@/lib/photos";
import { useMe } from "@/lib/session";
import { useGardens } from "@/lib/gardens";

export const Route = createFileRoute("/_authenticated/nueva")({
  head: () => ({ meta: [{ title: "Publicar — Huerta Hoy" }, { name: "description", content: "Nueva entrada de diario o consulta." }] }),
  component: Nueva,
});

const today = () => new Date().toLocaleDateString("en-CA");

function Nueva() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: gardens } = useGardens(me?.id);
  const [type, setType] = useState<"entrada" | "consulta">("entrada");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [plant, setPlant] = useState("");
  const [gardenId, setGardenId] = useState<string>("new");
  const [newName, setNewName] = useState("");
  const [kind, setKind] = useState<"huerta" | "planta">("huerta");
  const [saving, setSaving] = useState(false);

  function pick(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Solo fotos, sin video.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (!file) return toast.error("Elegí una foto.");
    if (!body.trim()) return toast.error(type === "consulta" ? "Escribí tu pregunta." : "Escribí una nota.");
    if (type === "consulta" && !plant.trim()) return toast.error("Poné el nombre de la planta.");
    if (type === "entrada" && gardenId === "new" && !newName.trim()) return toast.error("Ponele nombre a tu huerta o planta.");
    setSaving(true);
    try {
      let gid: string | null = null;
      if (type === "entrada") {
        if (gardenId === "new") {
          const { data, error } = await supabase.from("gardens").insert({ user_id: me.id, name: newName.trim(), kind }).select("id").single();
          if (error) throw error;
          gid = data.id;
        } else gid = gardenId;
      }
      const path = await uploadPhoto(file, me.id);
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: me.id,
          type,
          garden_id: gid,
          image_path: path,
          body: body.trim(),
          plant_name: type === "consulta" ? plant.trim() : null,
          taken_on: type === "entrada" ? date : today(),
        })
        .select("id")
        .single();
      if (error) throw error;
      qc.invalidateQueries();
      toast.success("¡Publicado!");
      navigate({ to: "/post/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  }

  const chip = (active: boolean) =>
    `flex-1 rounded-full py-2.5 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`;

  return (
    <AppShell title="Publicar">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2 rounded-full bg-secondary p-1">
          <button type="button" className={chip(type === "entrada")} onClick={() => setType("entrada")}>Entrada de diario</button>
          <button type="button" className={chip(type === "consulta")} onClick={() => setType("consulta")}>Consulta</button>
        </div>

        <label className="relative flex aspect-[4/5] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-soil/30 bg-card">
          {preview ? (
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera className="h-10 w-10" /> Tocá para elegir una foto
            </span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </label>

        {type === "entrada" ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold">¿De qué huerta o planta?</label>
              <select
                value={gardenId}
                onChange={(e) => setGardenId(e.target.value)}
                className="h-12 w-full rounded-2xl border border-input bg-card px-3"
              >
                <option value="new">+ Nueva huerta o planta</option>
                {gardens?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.kind})
                  </option>
                ))}
              </select>
            </div>
            {gardenId === "new" && (
              <>
                <div className="flex gap-2">
                  <button type="button" className={chip(kind === "huerta")} onClick={() => setKind("huerta")}>Huerta</button>
                  <button type="button" className={chip(kind === "planta")} onClick={() => setKind("planta")}>Planta</button>
                </div>
                <Input className="h-12 rounded-2xl" placeholder="Nombre (ej: Huerta del fondo)" maxLength={60} value={newName} onChange={(e) => setNewName(e.target.value)} />
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Fecha</label>
              <Input className="h-12 rounded-2xl" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Textarea className="rounded-2xl" placeholder="Nota corta: ¿cómo viene?" maxLength={280} value={body} onChange={(e) => setBody(e.target.value)} />
          </>
        ) : (
          <>
            <Input className="h-12 rounded-2xl" placeholder="Nombre de la planta" maxLength={60} value={plant} onChange={(e) => setPlant(e.target.value)} />
            <Textarea className="rounded-2xl" placeholder="Tu pregunta (ej: ¿por qué se ponen amarillas las hojas?)" maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} />
          </>
        )}

        <Button type="submit" disabled={saving} className="h-12 w-full rounded-full text-base">
          {saving ? "Subiendo…" : "Publicar"}
        </Button>
      </form>
    </AppShell>
  );
}
