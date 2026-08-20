/**
 * Emits JSON-LD. Rendered server-side so crawlers see it in the initial HTML rather than
 * only after hydration.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is escaped below; </script> inside a string literal is the
          // only sequence that could break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\u003c") }}
        />
      ))}
    </>
  );
}
