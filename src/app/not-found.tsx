import Link from "next/link";
import { Mascot } from "@/components/doodles";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Mascot size={120} className="mx-auto float" />
      <h1 className="title-hand mt-4 text-6xl">404, page got erased</h1>
      <p className="mt-2 text-ink-soft">The doodle you are looking for is not in this notebook.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
