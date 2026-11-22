/**
 * Small ML building blocks: tensors, tokens and the shapes papers use for
 * layers (trapezoid encoders, positional encodings, frozen modules …).
 * Plain colored boxes are left out on purpose: draw a rectangle and pick a
 * theme color (the conventions are in the nn-architectures skill).
 */
import { libraryItem as item, type LibrarySection } from "@nn-diagram/editor";
import { posEncoding, repeat, tokens, vector } from "./build";
import { mediaImage } from "./media";

const sizeOf = (snippet: string) => {
  const m = /w=\{(\d+)\} h=\{(\d+)\}/.exec(snippet);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
};

/** Copies of a vector stacked back to front, 4 px apart (heads, batches). */
function stackedVectors(groups: number[], copies = 3): string {
  const [w, h] = sizeOf(vector(groups));
  const d = 4 * (copies - 1);
  const layers = Array.from({ length: copies }, (_, i) => vector(groups, { x: d - i * 4, y: i * 4, boxVariant: "default" }));
  return `<Group x={0} y={0} w={${w + d}} h={${h + d}}>\n${layers.join("\n")}\n</Group>`;
}

const sub = (base: string, i: string) => `${base}<sub>${i}</sub>`;

function embeddingRow(): string {
  const cells = [sub("T", "1"), sub("T", "2"), sub("T", "3"), "…", sub("T", "N")].map((c) => `<Cell>${c}</Cell>`).join("");
  return `<Table x={0} y={0} w={200} h={28} variant="violet">\n  <Row>${cells}</Row>\n</Table>`;
}

function embeddingColumn(): string {
  const rows = [sub("I", "1"), sub("I", "2"), sub("I", "3"), "⋮", sub("I", "N")].map((c) => `  <Row><Cell>${c}</Cell></Row>`).join("\n");
  return `<Table x={0} y={0} w={36} h={140} variant="green">\n${rows}\n</Table>`;
}

function similarityMatrix(): string {
  const idx = ["1", "2", "3", "N"];
  const rows = idx.map((i, r) => {
    const cells = idx.map((j, c) => `<Cell${r === c ? ' variant="blue"' : ""}>${sub("I", i)}·${sub("T", j)}</Cell>`);
    return `  <Row>${cells.join("")}</Row>`;
  });
  return `<Table x={0} y={0} w={224} h={112} className="text-[12px]">\n${rows.join("\n")}\n</Table>`;
}

/** Lower-triangular attention weights with a strong diagonal; empty cells above it are masked. */
function causalAttentionMap(n = 6): string {
  const rows: string[] = [];
  for (let r = 0; r < n; r++) {
    const cells: string[] = [];
    for (let c = 0; c < n; c++) {
      if (c > r) {
        cells.push("<Cell />");
        continue;
      }
      // Deterministic, plausible weights: recent tokens and the first token get more attention.
      const w = c === r ? 70 : c === 0 ? 50 : c === r - 1 ? 40 : [10, 20, 30][(r * 7 + c * 3) % 3];
      cells.push(`<Cell className="bg-orange-500/${w}" />`);
    }
    rows.push(`  <Row>${cells.join("")}</Row>`);
  }
  return `<Table x={0} y={0} w={${n * 16}} h={${n * 16}} lines="none">\n${rows.join("\n")}\n</Table>`;
}

const patched = mediaImage("bird-patches");
const samples = mediaImage("image-samples");

export const TENSORS_SECTION: LibrarySection = {
  id: "ml-tensors",
  title: "Tensors & tokens",
  items: [
    item("tok-text", "Text tokens", tokens([...repeat("amber", 4), "...", ...repeat("amber", 2)]), "sequence token ids words"),
    item("tok-image", "Image tokens", tokens([...repeat("blue", 4), "...", ...repeat("blue", 2)]), "patches visual sequence"),
    item("tok-latent", "Latent tokens", tokens([...repeat("emerald", 4), "...", ...repeat("emerald", 2)]), "latent sequence"),
    item("tok-noise", "Noise tokens", tokens([...repeat("gray", 4), "...", ...repeat("gray", 2)]), "noise diffusion sequence"),
    item("tok-mixed", "Text + image sequence", tokens([...repeat("amber", 3), "|", ...repeat("blue", 4)]), "multimodal interleaved concat"),
    item("tok-column", "Token column", tokens([...repeat("emerald", 3), "...", ...repeat("emerald", 2)], { vertical: true }), "vector vertical sequence"),
    item("vector", "Hidden state", vector([4, 4]), "vector activation embedding circles"),
    item("vectors", "Stacked vectors", stackedVectors([2, 2]), "heads batch multi-head stack"),
    item("emb-row", "Embedding row", embeddingRow(), "embeddings T1 TN vector clip"),
    item("emb-col", "Embedding column", embeddingColumn(), "embeddings I1 IN vector clip"),
    item("sim-matrix", "Similarity matrix", similarityMatrix(), "contrastive clip logits pairwise matrix"),
    item("attn-map", "Attention map", causalAttentionMap(), "causal mask weights heatmap matrix"),
    item(
      "fmap-bar",
      "Feature map (U-Net)",
      `<Group x={0} y={0} w={40} h={140}>
  <Text x={0} y={0} w={40} h={16} variant="label" className="justify-center">64</Text>
  <Box x={12} y={20} w={16} h={100} variant="blue" className="rounded-none" />
  <Text x={0} y={124} w={40} h={16} variant="label" className="justify-center">572²</Text>
</Group>`,
      "channels resolution unet bar 2d",
    ),
    item(
      "tensor-dims",
      "Tensor H×W×C",
      `<Group x={0} y={0} w={112} h={116}>
  <Cuboid x={16} y={0} w={88} h={96} depth={24} variant="blue" />
  <Text x={0} y={48} w={12} h={16} variant="math">H</Text>
  <Text x={40} y={100} w={16} h={16} variant="math" className="justify-center">W</Text>
  <Text x={96} y={88} w={16} h={16} variant="math">C</Text>
</Group>`,
      "cuboid 3d feature map volume dimensions",
    ),
    item("slab", "Thin tensor", `<Cuboid x={0} y={0} w={32} h={112} depth={24} variant="teal" />`, "cuboid 3d feature map conv slab"),
    item(
      "latent-bar",
      "Latent z",
      `<Group x={0} y={0} w={32} h={108}>
  <Box x={8} y={0} w={16} h={84} variant="emerald" />
  <Text x={0} y={88} w={32} h={20} variant="math" className="justify-center">z</Text>
</Group>`,
      "latent code bottleneck ldm",
    ),
    item(
      "vit-token",
      "Patch + position",
      `<Group x={0} y={0} w={32} h={32}>
  <Box x={0} y={0} w={16} h={32} variant="violet" className="rounded-full p-0">1</Box>
  <Box x={16} y={0} w={16} h={32} variant="pink" className="rounded-full p-0" />
</Group>`,
      "vit embedding position patch token pair",
    ),
    item("patched-image", "Patched image", patched.jsx, "patchify vit grid patches image", patched.assets),
    item(
      "docs-stack",
      "Text samples",
      `<Group x={0} y={0} w={112} h={72}>
  <Box x={8} y={0} w={104} h={60} />
  <Box x={4} y={4} w={104} h={60} />
  <Box x={0} y={8} w={104} h={64} className="items-start justify-start p-2 text-left font-mono text-[11px]">a photo of<br />a dog</Box>
</Group>`,
      "documents captions prompts text stack paper",
    ),
    item(
      "image-stack",
      "Image samples",
      samples.jsx,
      "images batch photos stack dataset",
      samples.assets,
    ),
    item(
      "prob-bars",
      "Probabilities",
      `<Group x={0} y={0} w={76} h={48}>
  <Box x={0} y={36} w={12} h={12} variant="green" className="rounded-none" />
  <Box x={16} y={20} w={12} h={28} variant="green" className="rounded-none" />
  <Box x={32} y={4} w={12} h={44} variant="green" className="rounded-none" />
  <Box x={48} y={28} w={12} h={20} variant="green" className="rounded-none" />
  <Box x={64} y={40} w={12} h={8} variant="green" className="rounded-none" />
</Group>`,
      "softmax distribution histogram bar chart top-k logits",
    ),
  ],
};

export const LAYERS_SECTION: LibrarySection = {
  id: "ml-layers",
  title: "Layers & annotations",
  items: [
    item("encoder", "Encoder", `<Box x={0} y={0} w={96} h={72} shape="trapezoid" narrow="right" inset={0.2} variant="blue">Encoder</Box>`, "trapezoid compress funnel"),
    item("decoder", "Decoder", `<Box x={0} y={0} w={96} h={72} shape="trapezoid" narrow="left" inset={0.2} variant="blue">Decoder</Box>`, "trapezoid expand generator"),
    item("encoder-up", "Encoder (bottom to top)", `<Box x={0} y={0} w={136} h={48} shape="trapezoid" narrow="top" inset={0.12} variant="blue">Encoder</Box>`, "trapezoid vertical"),
    item(
      "unet",
      "U-Net",
      `<Group x={0} y={0} w={136} h={112}>
  <Box id="unet-down" x={0} y={0} w={64} h={96} shape="trapezoid" narrow="right" inset={0.25} variant="blue" />
  <Box id="unet-up" x={72} y={0} w={64} h={96} shape="trapezoid" narrow="left" inset={0.25} variant="blue" />
  <Arrow from="unet-down@right" to="unet-up@left" head="none" />
  <Text x={0} y={96} w={136} h={16} variant="label" className="justify-center">U-Net</Text>
</Group>`,
      "denoiser bowtie diffusion encoder decoder",
    ),
    item("pos-enc", "Positional encoding", posEncoding(), "sinusoidal sine wave position transformer"),
    item("frozen", "Frozen ❄", `<Icon x={0} y={0} w={20} h={20} name="snowflake" variant="sky" />`, "frozen pretrained snowflake badge"),
    item("trainable", "Trainable 🔥", `<Icon x={0} y={0} w={20} h={20} name="flame" variant="orange" />`, "trainable trained fine-tuned flame fire badge"),
    item(
      "frozen-module",
      "Frozen module",
      `<Box x={0} y={0} w={152} h={32} variant="slate">
  Text encoder
  <Icon x={128} y={8} w={16} h={16} name="snowflake" variant="sky" />
</Box>`,
      "pretrained frozen encoder snowflake",
    ),
    item(
      "trained-module",
      "Trained module",
      `<Box x={0} y={0} w={152} h={32} variant="sky">
  Denoiser
  <Icon x={128} y={8} w={16} h={16} name="flame" variant="orange" />
</Box>`,
      "trainable fine-tuned flame",
    ),
    item(
      "stacked",
      "Stacked (×h)",
      `<Group x={0} y={0} w={152} h={40}>
  <Box x={8} y={0} w={144} h={32} variant="orange" />
  <Box x={4} y={4} w={144} h={32} variant="orange" />
  <Box x={0} y={8} w={144} h={32} variant="orange">Attention head</Box>
</Group>`,
      "heads parallel copies stack multi-head",
    ),
    item(
      "conv-kernel",
      "Convolution kernel",
      `<Group x={0} y={0} w={160} h={104}>
  <Cuboid x={0} y={0} w={72} h={104} depth={24} variant="teal" />
  <Cuboid x={16} y={40} w={28} h={32} depth={8} variant="gray" />
  <Cuboid x={116} y={24} w={44} h={64} depth={16} variant="teal" />
  <Box x={128} y={52} w={8} h={8} variant="gray" className="rounded-none" />
  <Arrow from={[36, 48]} to={[128, 52]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[36, 72]} to={[128, 60]} route="straight" head="none" variant="muted" dashed />
</Group>`,
      "conv receptive field filter cuboid dcgan",
    ),
    item(
      "zoom",
      "Zoom-in lines",
      `<Group x={0} y={0} w={136} h={96}>
  <Box id="zoom-src" x={0} y={36} w={48} h={24} variant="yellow" />
  <Box id="zoom-detail" x={88} y={0} w={48} h={96} variant="panel-blue" className="border-dashed" />
  <Arrow from="zoom-src@top-right" to="zoom-detail@top-left" route="straight" head="none" variant="blue" dashed />
  <Arrow from="zoom-src@bottom-right" to="zoom-detail@bottom-left" route="straight" head="none" variant="blue" dashed />
</Group>`,
      "detail magnify expand callout explode",
    ),
    item("residual", "Residual connection", `<Arrow from={[48, 64]} to={[48, 0]} via={[[0, 64], [0, 0]]} variant="muted" />`, "skip identity shortcut add"),
    item("skip", "Skip connection (copy)", `<Arrow from={[0, 12]} to={[120, 12]} variant="muted" className="stroke-3" />`, "copy crop unet concat long"),
    item("grad", "Gradient flow", `<Arrow from={[96, 12]} to={[0, 12]} variant="red" dashed><Math tex="\\nabla_\\theta \\mathcal{L}" /></Arrow>`, "backprop backward loss feedback"),
    item("cond", "Conditioning", `<Arrow from={[0, 12]} to={[96, 12]} variant="indigo" dashed>c</Arrow>`, "condition adaln guidance modulation"),
    item(
      "dim-brace",
      "Dimension brace",
      `<Group x={0} y={0} w={96} h={32}>
  <Text x={0} y={0} w={96} h={16} variant="label" className="justify-center">1024</Text>
  <Brace x={0} y={20} w={96} h={12} side="top" />
</Group>`,
      "channels width size annotation",
    ),
    item("shape-label", "Tensor shape", `<Text x={0} y={0} variant="label"><Math tex="B \\times T \\times d" /></Text>`, "dimensions batch annotation"),
  ],
};
