import { Mascot, Sparkle, Star } from "@/components/doodles";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <div className="relative mb-4">
        <Mascot size={96} className="float" />
        <Sparkle className="absolute -right-6 top-2" size={22} />
        <Star className="absolute -left-7 bottom-3" size={20} color="#ff5da2" />
      </div>
      <div className="w-full sketch-2 tape relative p-6 md:p-8">{children}</div>
    </div>
  );
}
