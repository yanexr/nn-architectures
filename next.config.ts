import type { NextConfig } from "next";

// GitHub Pages serves the site from https://yanexr.github.io/nn-architectures/.
const basePath = process.env.NODE_ENV === "production" ? "/nn-architectures" : "";

const nextConfig: NextConfig = {
  // Next.js would otherwise rewrite AGENTS.md on every `next dev`.
  agentRules: false,
  // A static site: `next build` writes it to out/.
  output: "export",
  // Pages as folder/index.html, which GitHub Pages serves without redirects.
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  transpilePackages: ["@nn-diagram/format", "@nn-diagram/viewer", "@nn-diagram/editor"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
