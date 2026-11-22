---
name: nn-architectures
description: Conventions for neural-network and ML architecture diagrams (colors, shapes, lines, layout, media) on the nn-architectures website, and how to add a model to its content folder. Use together with the nn-diagram skill when drawing, redrawing or editing a model diagram in this repo, or when adding or updating a model page.
license: MIT
---

# Neural-network diagrams for nn-architectures

The file format, tools and layout rules are in the **nn-diagram** skill (`.agents/skills/nn-diagram/SKILL.md`). In this repo run the CLI as `pnpm nn-diagram <command>` (for example `pnpm nn-diagram check content`, `pnpm nn-diagram render content/models/openai/gpt-2/architecture.diagram.jsx -o /tmp`).

The conventions below are the **default style**, so diagrams on the site look alike. They are not rules: when the user asks to redraw a figure from an image or to match a paper's look, copy that figure's colors, shapes and fonts (`className="bg-[#fcdcb5] border-[#d79b00]"`, `font-serif`, …) instead.

## Colors

One color per kind of component, chosen from the theme variants (they adapt to dark mode). Based on the colors of *Attention Is All You Need*, which most papers copy.

| Component | Variant |
|---|---|
| Attention (self, cross, MHA, GQA, MLA) | `orange` |
| Feed-forward, MLP, SwiGLU, experts | `sky` |
| Normalization, Add & Norm (LayerNorm, RMSNorm, BatchNorm) | `yellow` |
| Embedding, tokenizer, patchify, positional embedding | `pink` |
| Linear, projection, head, unembedding | `violet` |
| Activation, softmax, sampling, output distribution | `green` |
| Convolution | `teal` |
| Pooling, up/down-sampling | `cyan` |
| Recurrent cell (RNN, LSTM, GRU, SSM) | `purple` |
| Router, gate (MoE) | `fuchsia` |
| Conditioning (adaLN, FiLM, timestep, class, guidance) | `indigo` |
| Loss, objective | `red` |
| Encoder / decoder modules | `blue` (trapezoids show the direction) |
| Latent, bottleneck, codebook | `emerald` |
| Frozen / pretrained black box | `slate`, plus a snowflake icon |
| Large module seen as one block (backbone, "Transformer encoder") | `gray` |
| Secondary detail, inactive option | `muted` |

Data colors (tokens, vectors, small squares): text `amber`, image/patches `blue`, pixels `rose`, audio `green`, video `purple`, latent `emerald`, noise `gray`, condition `indigo`. Mark the main block of a figure with `className="font-semibold"` sparingly.

Trainable vs frozen: `<Icon name="flame" variant="orange" />` and `<Icon name="snowflake" variant="sky" />` (16–20 px) in a corner of the module (child of the box, label padded with `pl-*`/`pr-*` if needed).

## Lines

| Meaning | Arrow |
|---|---|
| Data flow | default |
| Residual / skip connection | `variant="muted"`; leave the main line at a free point, route around with `via`, end at `add@left` |
| Long skip (U-Net "copy and crop") | `variant="muted" className="stroke-3"` |
| Conditioning | `variant="indigo" dashed` |
| Gradient, loss feedback | `variant="red" dashed` |
| Inactive / optional route (unused experts) | `variant="muted" dashed` |
| Zoom-in to a detail panel | `route="straight" head="none" dashed`, from the block's corners to the panel's corners |
| Dense connections between neurons | `route="straight" head="none" variant="muted"` |

Fan-out to many targets (one encoder output to every token): one `head="none"` trunk and branches starting on it (`from="trunk@0.3"`), not overlapping arrows. Use color for line meaning only with a legend (the library's "Arrow legend" block).

## Containers

- Repeated block: `variant="panel"` with `×N` (`<Text variant="label">×N</Text>` in the top-right corner, or `N×` beside it as in the original Transformer figure).
- Module with parts (MoE layer, attention internals): `panel-<hue>` of its color.
- Zoom-in detail: `panel-blue` with `className="border-dashed"`, connected by dashed zoom lines.
- Spaces / stages (pixel vs latent space, training vs inference): one panel each, e.g. `panel-rose` and `panel-emerald`.

## Shapes

- **Encoders/decoders**: trapezoids. Horizontal flow: encoder `narrow="right"`, decoder `narrow="left"`; vertical (bottom to top): `narrow="top"`. A U-Net is two trapezoids facing each other (bowtie).
- **Feature maps**: `<Cuboid>` (2.5D, DCGAN/AlexNet style; `side="left"` for the DCGAN view with the depth receding to the upper left) with the dimensions as texts or braces; or thin `rounded-none` bars (U-Net style) with the channel count above and the resolution below.
- **Tokens**: 12 px squares, 4 px apart, `className="rounded-[2px]"`, in a `<Group>`, `…` as a label text between runs. `<Tokens>` is a compact alternative when nobody will edit single tokens.
- **Hidden-state vectors**: small circles in a `rounded-full` box (`○○○○ ⋯ ○○○○`); stacked copies offset by 4 px for heads or batches.
- **Matrices and embedding rows**: `<Table>`; highlight cells with `variant` (the diagonal of a similarity matrix), heatmaps with `lines="none"` and `bg-<hue>-500/<opacity>` cells.
- **Networks of neurons**: circles (`shape="ellipse"`, 24 px) in a `<Group>`, inputs `green`, hidden `blue`, outputs `orange`; layer names as labels below. `<Neurons>` is the compact alternative.
- **Operators**: `<Op>` ⊕ add (residuals), ⊗ multiply (gates), ⊙ concat; on a line, after the arrows.
- **Positional encoding**: a 24 px circle with an S-shaped wave from edge to edge (two half circles of half the diameter, so the wave meets the outline without a gap), next to the ⊕, as in the Transformer figure. Copy it from the library (`posEncoding()` in `ml-library/build.ts`) or from `content/models` rather than drawing the curve by hand.
- **Data**: images from the media library, `stone` boxes, or plain text labels ("Inputs", "Output probabilities") at the ends of the flow.

## Layout

- Transformer-style stacks flow **bottom to top** (inputs at the bottom), pipelines and generative models **left to right**.
- Boxes in a column share one width and one center axis (straight arrows), 16–28 px apart.
- Labels: the paper's names, in one consistent case. Math in `$…$` or `<Math>`; variables as `variant="math"` texts (`Q`, `K`, `V`, `x`).
- Keep figures compact: about 400–900 px wide. Use `<Steps>` and `tip`s for detail instead of crowding the figure.

## Library and media

The editor's ML sections (Tensors & tokens, Layers & annotations, Neural networks, Blocks, Data · …, Plots, Illustrations) are built in `src/lib/ml-library/` (`shapes.ts`, `networks.ts`, `blocks.ts`, `media.ts`; generators for neurons, tokens and vectors in `build.ts`). They follow these conventions; keep them in sync when the conventions change. Look at them as examples of good snippets, and check changes visually:

```bash
pnpm gallery /tmp/gallery
pnpm nn-diagram render /tmp/gallery
```

Media files (photos, scans, signals, plots, illustrations) are in `public/media/` (list in its README and in `media.ts`). Copy a file next to the diagram to use it (`<Image … src="dog.webp" />`). Images have square corners by default. The colorful illustrations (`brain.svg`, `gpu.svg`, `robot.svg`, `database.svg`, …) suit system and pipeline figures; Lucide `<Icon>`s suit small badges.

## Examples

`content/models/*/*/*.diagram.jsx` (GPT-2, Iris-3B, DCGAN).

## Adding a model to the website

`content/models/<lab>/<model>/` with:
- `model.json`: `name, lab, released (YYYY-MM-DD), summary, sizes (e.g. ["7B", "120B-A4B"], or []), input and output (lists of modalities: ["text"], ["noise"], ["text", "image"]), tags, license, links {huggingface, github, paper, blog, website}, diagrams [{file, title}]` (the first diagram is the default tab). The page URL is `/<lab>/<model>` from the folder names.
- `README.md`: how it works (Markdown, GFM tables, `$…$` / `$$…$$` math)
- one or more `*.diagram.jsx` files, plus any images they reference.

Tips (`tip`) and steps state only what the paper or model card says.
