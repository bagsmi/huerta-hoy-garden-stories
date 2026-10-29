import { Link } from "@tanstack/react-router";
import { Photo } from "@/components/huerta";

type Garden = { id: string; name: string; kind: string; posts: { image_path: string; taken_on: string }[] };

export function GardenGrid({ gardens }: { gardens: Garden[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {gardens.map((g) => {
        const latest = [...g.posts].sort((a, b) => b.taken_on.localeCompare(a.taken_on))[0];
        return (
          <Link key={g.id} to="/diario/$gardenId" params={{ gardenId: g.id }} className="relative overflow-hidden rounded-3xl shadow-soft">
            <Photo path={latest?.image_path} alt={g.name} className="aspect-[3/4] w-full" />
            <div className="absolute inset-0 photo-fade" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-cream">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                {g.kind === "planta" ? "Planta" : "Huerta"} · {g.posts.length} fotos
              </p>
              <p className="font-display text-lg font-semibold leading-tight">{g.name}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
