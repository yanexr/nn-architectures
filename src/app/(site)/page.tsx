import { Suspense } from "react";
import { EditorPeek } from "@/components/editor-peek";
import { Gallery, type GalleryModel } from "@/components/gallery";
import { getAllModels, toSearchEntry } from "@/lib/models";

/** The diagram shown in the editor sketch (falls back to the newest model). */
const PEEK_MODEL = "/openai/gpt-2";

export default function HomePage() {
  const all = getAllModels();
  const models: GalleryModel[] = all.map((m) => ({
    ...toSearchEntry(m),
    parsedSizes: m.parsedSizes,
    preview: m.diagrams[0] ? { source: m.diagrams[0].source, url: m.diagrams[0].url } : null,
  }));
  const peekModel = all.find((m) => m.href === PEEK_MODEL && m.diagrams.length) ?? all.find((m) => m.diagrams.length);
  const peek = peekModel ? { source: peekModel.diagrams[0].source, url: peekModel.diagrams[0].url, file: peekModel.diagrams[0].file } : null;

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 sm:px-6 lg:px-8">
      <section className="grid gap-10 border-b border-border lg:grid-cols-[minmax(0,1fr)_468px]">
        <div className="self-center pt-9 pb-8 sm:pt-12 lg:py-12">
          <h1 className="font-serif text-[38px] leading-[1.04] font-normal tracking-[-0.025em] sm:text-[48px]">
            Neural network
            <br />
            <em className="font-light">architectures</em>
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
            A collection of interactive model diagrams with short descriptions on each part. Any figure can be edited, exported, or used as the base for your own.
          </p>
        </div>
        <EditorPeek diagram={peek} />
      </section>
      <Suspense>
        <Gallery models={models} />
      </Suspense>
    </main>
  );
}
