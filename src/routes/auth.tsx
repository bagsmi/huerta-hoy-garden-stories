import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { passwordError, usernameError } from "@/lib/validation";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ mode: s.mode === "signup" ? "signup" : "login" }) as { mode: "login" | "signup" },
  head: () => ({
    meta: [
      { title: "Entrar — Huerta Hoy" },
      { name: "description", content: "Ingresá o creá tu cuenta en Huerta Hoy." },
      { property: "og:title", content: "Entrar a Huerta Hoy" },
      { property: "og:description", content: "Ingresá o creá tu cuenta en Huerta Hoy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (signup) {
        const uErr = usernameError(username);
        if (uErr) return toast.error(uErr);
        const pErr = passwordError(password);
        if (pErr) return toast.error(pErr);
        const { data: free } = await supabase.rpc("username_available", { _username: username });
        if (!free) return toast.error("Ese nombre de usuario ya está en uso.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/feed", data: { username } },
        });
        if (error) return toast.error(error.message);
        if (data.session) navigate({ to: "/feed" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return toast.error("Email o contraseña incorrectos.");
        navigate({ to: "/feed" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link to="/" className="mb-8 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <Sprout className="h-7 w-7" /> Huerta Hoy
      </Link>
      {sent ? (
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">¡Revisá tu correo!</h2>
          <p className="mt-2 text-muted-foreground">Te mandamos un link a {email} para confirmar tu cuenta.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-3xl font-semibold">{signup ? "Creá tu cuenta" : "Hola de nuevo"}</h2>
          <Input className="h-12 rounded-2xl" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {signup && (
            <Input className="h-12 rounded-2xl" required placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value.trim())} />
          )}
          <Input className="h-12 rounded-2xl" type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          {signup && <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, con letras y números.</p>}
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base">
            {loading ? "Un momento…" : signup ? "Registrarme" : "Entrar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {signup ? "¿Ya tenés cuenta? " : "¿No tenés cuenta? "}
            <Link to="/auth" search={{ mode: signup ? "login" : "signup" }} className="font-semibold text-primary">
              {signup ? "Entrá" : "Registrate"}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
