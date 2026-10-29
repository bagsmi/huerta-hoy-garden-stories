import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Huerta Hoy — tu diario de huerta y plantas" },
      { name: "description", content: "Registrá cómo crece tu huerta, mirá las de otros y hacé consultas sobre tus plantas." },
      { property: "og:title", content: "Huerta Hoy" },
      { property: "og:description", content: "El diario de fotos para amantes de las huertas y las plantas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-end overflow-hidden bg-forest">
      <img src={hero} alt="Canasta con cosecha de la huerta" width={864} height={1280} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 photo-fade" />
      <div className="relative space-y-5 p-7 pb-12 text-cream">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
          <Sprout className="h-5 w-5" /> Huerta Hoy
        </p>
        <h1 className="text-5xl font-semibold leading-[1.05]">Mirá crecer lo que plantás.</h1>
        <p className="text-lg opacity-90">Llevá el diario de tu huerta, compartí fotos y preguntale a la comunidad.</p>
        <div className="flex gap-3 pt-2">
          <Link to="/auth" search={{ mode: "signup" }} className="flex-1 rounded-full bg-cream py-4 text-center font-semibold text-forest">
            Crear cuenta
          </Link>
          <Link to="/auth" search={{ mode: "login" }} className="flex-1 rounded-full border border-cream/60 py-4 text-center font-semibold">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
