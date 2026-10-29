import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Heart, MessageCircle, MoreHorizontal, Home, BookOpen, PlusCircle, User, Flag, Ban, Sprout } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePhotoUrl } from "@/lib/photos";
import { useMe, type FeedPost } from "@/lib/session";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function Photo({ path, alt, className }: { path?: string | null; alt: string; className?: string }) {
  const url = usePhotoUrl(path);
  return url ? (
    <img src={url} alt={alt} loading="lazy" className={`object-cover ${className ?? ""}`} />
  ) : (
    <div className={`bg-muted animate-pulse ${className ?? ""}`} />
  );
}

export function Avatar({ path, name, size = 36 }: { path?: string | null; name: string; size?: number }) {
  const url = usePhotoUrl(path);
  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0 overflow-hidden rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold"
    >
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function formatDate(d: string) {
  return new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PostMenu({ post }: { post: FeedPost }) {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!me || me.id === post.user_id) return null;

  async function block() {
    if (!confirm(`¿Bloquear a @${post.profiles?.username}? No vas a ver más sus publicaciones.`)) return;
    const { error } = await supabase.from("blocks").insert({ blocker_id: me!.id, blocked_id: post.user_id });
    if (error && error.code !== "23505") return toast.error("No se pudo bloquear.");
    toast.success("Usuario bloqueado.");
    qc.invalidateQueries();
    navigate({ to: "/feed" });
  }

  async function report() {
    const { error } = await supabase
      .from("reports")
      .insert({ post_id: post.id, reporter_id: me!.id, reason: reason.trim() || "Sin motivo" });
    setReportOpen(false);
    setReason("");
    if (error && error.code !== "23505") return toast.error("No se pudo enviar el reporte.");
    toast.success("Gracias, recibimos tu reporte.");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Opciones" className="rounded-full p-2 hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" /> Reportar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={block} className="text-destructive">
            <Ban className="h-4 w-4" /> Bloquear usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Reportar publicación</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Contanos qué pasa (opcional)"
            value={reason}
            maxLength={300}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={report}>Enviar reporte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LikeButton({ post }: { post: FeedPost }) {
  const me = useMe();
  const qc = useQueryClient();
  const liked = !!me && post.likes.some((l) => l.user_id === me.id);
  async function toggle() {
    if (!me) return;
    if (liked) await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", me.id);
    else await supabase.from("likes").insert({ post_id: post.id, user_id: me.id });
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["post", post.id] });
  }
  return (
    <button onClick={toggle} aria-label={liked ? "Quitar me gusta" : "Me gusta"} className="flex items-center gap-1.5">
      <Heart className={`h-6 w-6 transition-transform active:scale-125 ${liked ? "fill-accent text-accent" : ""}`} />
      <span className="text-sm font-medium">{post.likes.length}</span>
    </button>
  );
}

export function TypeBadge({ post }: { post: FeedPost }) {
  if (post.type === "consulta")
    return <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Consulta</span>;
  return (
    <span className="rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-forest">
      {post.gardens?.kind === "planta" ? "Planta" : "Huerta"} · {post.gardens?.name}
    </span>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-soft">
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar path={post.profiles?.avatar_path} name={post.profiles?.username ?? "?"} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">@{post.profiles?.username}</p>
          <p className="text-xs text-muted-foreground">{formatDate(post.taken_on)}</p>
        </div>
        <PostMenu post={post} />
      </header>
      <Link to="/post/$id" params={{ id: post.id }} className="relative block">
        <Photo path={post.image_path} alt={post.plant_name ?? post.body} className="aspect-[4/5] w-full" />
        <div className="absolute left-3 top-3">
          <TypeBadge post={post} />
        </div>
      </Link>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-5">
          <LikeButton post={post} />
          <Link to="/post/$id" params={{ id: post.id }} className="flex items-center gap-1.5">
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm font-medium">{post.comments[0]?.count ?? 0}</span>
          </Link>
        </div>
        {post.type === "consulta" && post.plant_name && (
          <p className="font-display text-lg font-semibold">{post.plant_name}</p>
        )}
        <p className="text-sm leading-relaxed">{post.body}</p>
      </div>
    </article>
  );
}

const NAV = [
  { to: "/feed", label: "Inicio", icon: Home },
  { to: "/diario", label: "Mi diario", icon: BookOpen },
  { to: "/nueva", label: "Publicar", icon: PlusCircle },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppShell({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background/90 px-5 py-4 backdrop-blur">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary">
          <Sprout className="h-6 w-6" /> {title}
        </h1>
        {action}
      </header>
      <main className="px-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-4 pb-4">
        <div className="flex justify-around rounded-full bg-forest px-2 py-2 text-cream shadow-soft">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[11px] opacity-70"
              activeProps={{ className: "bg-primary opacity-100" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
