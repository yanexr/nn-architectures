import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ModelDiagrams } from "@/components/model-diagrams";
import { ModelSplit } from "@/components/model-split";
import { getAllModels, getModel } from "@/lib/models";
import { formatRelease } from "@/lib/search";
import { formatCount } from "@/lib/sizes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModels().map((m) => ({ lab: m.labSlug, model: m.modelSlug }));
}

type Params = { params: Promise<{ lab: string; model: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lab, model } = await params;
  const m = getModel(lab, model);
  return { title: m ? `${m.name} · ${m.lab} · nn-architectures` : "Not found", description: m?.summary };
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] items-baseline gap-4 border-b border-border py-2.5">
      <dt className="label-caps">{label}</dt>
      <dd className="min-w-0 text-[14px]">{children}</dd>
    </div>
  );
}

const LINKS = [
  ["paper", "Paper"],
  ["github", "Code"],
  ["huggingface", "Hugging Face"],
  ["blog", "Blog"],
  ["website", "Website"],
] as const;

export default async function ModelPage({ params }: Params) {
  const { lab, model } = await params;
  const m = getModel(lab, model);
  if (!m) notFound();
  const links = LINKS.filter(([key]) => m.links?.[key]);

  return (
    <main className="flex flex-1 flex-col">
      <ModelSplit
        diagram={<ModelDiagrams name={m.name} diagrams={m.diagrams.map(({ title, file, url, source }) => ({ title, file, url, source }))} />}
        info={
          <div className="mx-auto max-w-[640px] px-5 pt-5 pb-20 sm:px-7 lg:pt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="size-3.5" /> All models
            </Link>

            <header className="mt-5">
              <div className="text-[13px] text-muted-foreground">{m.lab}</div>
              <h1 className="mt-0.5 font-serif text-[36px] leading-[1.08] font-normal tracking-[-0.02em]">{m.name}</h1>
              {m.summary && <p className="mt-3 font-serif text-[17px] leading-[1.45] font-[450] text-foreground/85 dark:font-normal">{m.summary}</p>}
              {links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {links.map(([key, label]) => (
                    <a
                      key={key}
                      href={m.links![key]}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 text-[13.5px] font-medium text-foreground/85 underline decoration-border decoration-1 underline-offset-[5px] transition-colors hover:text-clay-ink hover:decoration-clay"
                    >
                      {label}
                      <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors group-hover:text-clay-ink" />
                    </a>
                  ))}
                </div>
              )}
            </header>

            <dl className="mt-6 border-t border-border">
              <Meta label="Released">{formatRelease(m.released, "long")}</Meta>
              {m.parsedSizes.length > 0 && (
                <Meta label="Parameters">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[13px]">
                    {m.parsedSizes.map((s) => (
                      <span key={s.label} title={s.active ? `${formatCount(s.total ?? 0)} total, ${formatCount(s.active)} active` : undefined}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </Meta>
              )}
              <Meta label="Modalities">
                <span className="inline-flex items-center gap-1.5">
                  {m.input.join(", ")} <ArrowRight className="size-3.5 text-muted-foreground" /> {m.output.join(", ")}
                </span>
              </Meta>
              {m.tags && m.tags.length > 0 && (
                <Meta label="Architecture">
                  <div className="-my-0.5 flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/?q=${encodeURIComponent(t)}`}
                        className="inline-flex h-6 items-center rounded-full px-2.5 text-[12.5px] ring-1 ring-border ring-inset transition-colors hover:bg-foreground/[0.05]"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </Meta>
              )}
              {m.license && <Meta label="License">{m.license}</Meta>}
            </dl>

            {m.readme && (
              <article className="article prose mt-9 max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.readme}
                </ReactMarkdown>
              </article>
            )}
          </div>
        }
      />
    </main>
  );
}
