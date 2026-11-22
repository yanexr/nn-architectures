/** Serves raw content files (diagram sources, images) for the viewer and the editor. */
import { readFileSync } from "node:fs";
import { contentPath, listContentFiles } from "@/lib/models";

export const dynamic = "force-static";
export const dynamicParams = false;

const TYPES: Record<string, string> = {
  jsx: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export function generateStaticParams() {
  return listContentFiles().map((path) => ({ path }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const file = contentPath(path);
  if (!file) return new Response("Not found", { status: 404 });
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  return new Response(readFileSync(file), {
    headers: { "content-type": TYPES[ext] ?? "application/octet-stream" },
  });
}
