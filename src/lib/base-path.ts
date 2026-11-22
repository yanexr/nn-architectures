/**
 * Path prefix of the deployed site ("/nn-architectures" on GitHub Pages, ""
 * in development). Next.js adds it to links and router navigation itself;
 * plain URLs (raw content files, media, <a href>) need it explicitly.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
