import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Avatar, LikeButton, Photo, PostMenu, TypeBadge, formatDate } from "@/components/huerta";
import { Input } from "@/components/ui/input";
import { POST_SELECT, useMe, type FeedPost } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/post/$id")({
  head: () => ({ meta: [{ title: "Publicación — Huerta Hoy" }, { name: "description", content: "Detalle con me gusta y comentarios." }] }),
  component: PostDetail,
});

function PostDetail() {
  const { id } = Route.useParams();
  const me = useMe();
  const qc = useQueryClient();
  const router = useRouter();
  const [text, setText] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return data as unknown as FeedPost | null;
    },
  });
  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, profiles(username, avatar_path)")
        .eq("post_id", id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !text.trim()) return;
    const { error } = await supabase.from("comments").insert({ post_id: id, user_id: me.id, body: text.trim().slice(0, 300) });
    if (error) return void toast.error("No se pudo comentar.");
    setText("");
    qc.invalidateQueries({ queryKey: ["comments", id] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  }

  const back = (
    <button onClick={() => router.history.back()} aria-label="Volver" className="rounded-full p-2 hover:bg-muted">
      <ArrowLeft className="h-5 w-5" />
    </button>
  );

  if (!isLoading && !post)
    return (
      <AppShell title="Publicación" action={back}>
        <p className="text-muted-foreground">Esta publicación no está disponible.</p>
      </AppShell>
    );

  return (
    <AppShell title={post?.type === "consulta" ? "Consulta" : "Entrada"} action={back}>
      {post && (
        <article className="overflow-hidden rounded-3xl bg-card shadow-soft">
          <div className="relative">
            <Photo path={post.image_path} alt={post.body} className="aspect-[4/5] w-full" />
            <div className="absolute left-3 top-3"><TypeBadge post={post} /></div>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar path={post.profiles?.avatar_path} name={post.profiles?.username ?? "?"} />
              <div className="flex-1">
                <p className="font-semibold">@{post.profiles?.username}</p>
                <p className="text-xs text-muted-foreground">{formatDate(post.taken_on)}</p>
              </div>
              <LikeButton post={post} />
              <PostMenu post={post} />
            </div>
            {post.plant_name && <h2 className="text-2xl font-semibold">{post.plant_name}</h2>}
            <p className="leading-relaxed">{post.body}</p>
            {post.garden_id && post.user_id === me?.id && (
              <Link to="/diario/$gardenId" params={{ gardenId: post.garden_id }} className="inline-block text-sm font-semibold text-primary">
                Ver línea de tiempo →
              </Link>
            )}
          </div>
        </article>
      )}

      <section className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Comentarios</h3>
        {comments?.length === 0 && <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>}
        {comments?.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar path={c.profiles?.avatar_path} name={c.profiles?.username ?? "?"} size={32} />
            <div className="rounded-2xl bg-card px-4 py-2 shadow-soft">
              <p className="text-sm font-semibold">@{c.profiles?.username}</p>
              <p className="text-sm">{c.body}</p>
            </div>
          </div>
        ))}
        <form onSubmit={send} className="flex gap-2">
          <Input className="h-12 rounded-full" placeholder="Escribí un comentario…" maxLength={300} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" aria-label="Enviar" className="rounded-full bg-primary px-4 text-primary-foreground">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </section>
    </AppShell>
  );
}
