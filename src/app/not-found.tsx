import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center sm:py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/art/notfound.webp" alt="Puzzled Doodlebug holding an eraser" width={260} height={266} className="mx-auto h-auto w-[260px] float" />
      <h1 className="title-hand mt-4 text-4xl sm:text-5xl md:text-6xl">404, page got erased</h1>
      <p className="mt-2 text-ink-soft">The doodle you are looking for is not in this notebook.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
