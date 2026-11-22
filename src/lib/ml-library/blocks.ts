/**
 * Ready-made architecture blocks in the conventional style (colors as in
 * the nn-architectures skill). Inserting one gives ordinary shapes and
 * arrows to adapt. Templates are raw strings, so LaTeX is written as is.
 */
import { libraryItem as item, type LibrarySection } from "@nn-diagram/editor";
import { posEncoding, vector } from "./build";
import { mediaImage, mergeAssets } from "./media";

const j = String.raw;

/** A box with two copies behind it (up-right), for "×h" stacks. */
const stack = (id: string, x: number, y: number, w: number, h: number, variant: string, label: string) =>
  [
    `  <Box x={${x + 8}} y={${y - 8}} w={${w}} h={${h}} variant="${variant}" />`,
    `  <Box x={${x + 4}} y={${y - 4}} w={${w}} h={${h}} variant="${variant}" />`,
    `  <Box id="${id}" x={${x}} y={${y}} w={${w}} h={${h}} variant="${variant}">${label}</Box>`,
  ].join("\n");

const vaswaniEncoder = j`<>
  <Arrow from="tf-an2" to={[140, 0]} />
  <Box id="tf-layer" x={40} y={24} w={200} h={232} variant="panel">
    <Box id="tf-an2" x={20} y={16} w={160} h={24} variant="yellow">Add &amp; Norm</Box>
    <Box id="tf-ff" x={20} y={56} w={160} h={36} variant="sky">Feed Forward</Box>
    <Box id="tf-an1" x={20} y={116} w={160} h={24} variant="yellow">Add &amp; Norm</Box>
    <Box id="tf-mha" x={20} y={156} w={160} h={36} variant="orange">Multi-Head Attention</Box>
    <Arrow id="tf-qkv" from="tf-layer@bottom" to="tf-mha" />
    <Arrow from="tf-qkv@0.6" to="tf-mha@bottom:24px" via={[[44, 208]]} rounded={6} />
    <Arrow from="tf-qkv@0.6" to="tf-mha@bottom:136px" via={[[156, 208]]} rounded={6} />
    <Arrow from="tf-mha" to="tf-an1" />
    <Arrow id="tf-ff-in" from="tf-an1" to="tf-ff" />
    <Arrow from="tf-ff" to="tf-an2" />
    <Arrow from="tf-qkv@0.2" to="tf-an1@left" via={[[8, 224], [8, 128]]} variant="muted" />
    <Arrow from="tf-ff-in@0.5" to="tf-an2@left" via={[[8, 104], [8, 28]]} variant="muted" />
  </Box>
  <Text x={4} y={128} w={32} h={20} className="justify-end">N×</Text>
  <Op id="tf-add" x={132} y={276} w={16} h={16} />
${posEncoding({ id: "tf-pe", x: 172, y: 272 })}
  <Text x={204} y={268} w={80} h={32} variant="label">Positional<br />encoding</Text>
  <Box id="tf-emb" x={80} y={316} w={120} h={32} variant="pink">Input Embedding</Box>
  <Text id="tf-inputs" x={100} y={372} w={80} h={20} className="justify-center">Inputs</Text>
  <Arrow from="tf-inputs" to="tf-emb" />
  <Arrow from="tf-emb" to="tf-add" />
  <Arrow from="tf-pe" to="tf-add@right" />
  <Arrow from="tf-add" to="tf-layer@bottom" head="none" />
</>`;

const preNormBlock = j`<>
  <Box id="dec-block" x={0} y={24} w={220} h={332} variant="panel">
    Decoder block
    <Text x={184} y={8} variant="label">×L</Text>
    <Op id="dec-add2" x={102} y={36} w={16} h={16} />
    <Box id="dec-ffn" x={28} y={72} w={164} h={32} variant="sky">SwiGLU FFN</Box>
    <Box id="dec-norm2" x={28} y={128} w={164} h={28} variant="yellow">RMSNorm</Box>
    <Op id="dec-add1" x={102} y={184} w={16} h={16} />
    <Box id="dec-attn" x={28} y={220} w={164} h={32} variant="orange">Masked self-attention</Box>
    <Box id="dec-norm1" x={28} y={276} w={164} h={28} variant="yellow">RMSNorm</Box>
    <Arrow from="dec-norm1" to="dec-attn" />
    <Arrow from="dec-attn" to="dec-add1" />
    <Arrow id="dec-mid" from="dec-add1" to="dec-norm2" />
    <Arrow from="dec-norm2" to="dec-ffn" />
    <Arrow from="dec-ffn" to="dec-add2" />
    <Arrow from="dec-in@0.786" to="dec-add1@left" via={[[12, 316], [12, 192]]} variant="muted" />
    <Arrow from="dec-mid@0.727" to="dec-add2@left" via={[[12, 168], [12, 44]]} variant="muted" />
  </Box>
  <Arrow id="dec-in" from={[110, 384]} to="dec-norm1" />
  <Arrow from="dec-add2" to={[110, 0]} />
</>`;

const multiHead = j`<>
  <Arrow from="mha-out" to={[120, 0]} />
  <Box id="mha-out" x={60} y={24} w={120} h={24} variant="violet">Linear</Box>
  <Box id="mha-concat" x={60} y={72} w={120} h={24} variant="yellow">Concat</Box>
${stack("mha-sdpa", 24, 128, 192, 36, "orange", "Scaled Dot-Product Attention")}
  <Text x={228} y={128} w={16} h={20} variant="math">h</Text>
${stack("mha-lv", 12, 200, 56, 24, "violet", "Linear")}
${stack("mha-lk", 92, 200, 56, 24, "violet", "Linear")}
${stack("mha-lq", 172, 200, 56, 24, "violet", "Linear")}
  <Text id="mha-v" x={32} y={248} w={16} h={20} variant="math" className="justify-center">V</Text>
  <Text id="mha-k" x={112} y={248} w={16} h={20} variant="math" className="justify-center">K</Text>
  <Text id="mha-q" x={192} y={248} w={16} h={20} variant="math" className="justify-center">Q</Text>
  <Arrow from="mha-v" to="mha-lv" />
  <Arrow from="mha-k" to="mha-lk" />
  <Arrow from="mha-q" to="mha-lq" />
  <Arrow from="mha-lv" to="mha-sdpa@bottom:16px" />
  <Arrow from="mha-lk" to="mha-sdpa@bottom:96px" />
  <Arrow from="mha-lq" to="mha-sdpa@bottom:176px" />
  <Arrow from="mha-sdpa" to="mha-concat" />
  <Arrow from="mha-concat" to="mha-out" />
</>`;

const sdpa = j`<>
  <Arrow from="sdpa-mm2" to={[104, 0]} />
  <Box id="sdpa-mm2" x={56} y={24} w={96} h={24} variant="violet">MatMul</Box>
  <Box id="sdpa-softmax" x={24} y={72} w={96} h={24} variant="green">SoftMax</Box>
  <Box id="sdpa-mask" x={24} y={120} w={96} h={24} variant="pink">Mask (opt.)</Box>
  <Box id="sdpa-scale" x={24} y={168} w={96} h={24} variant="yellow">Scale</Box>
  <Box id="sdpa-mm1" x={24} y={216} w={96} h={24} variant="violet">MatMul</Box>
  <Text id="sdpa-q" x={36} y={264} w={16} h={20} variant="math" className="justify-center">Q</Text>
  <Text id="sdpa-k" x={92} y={264} w={16} h={20} variant="math" className="justify-center">K</Text>
  <Text id="sdpa-v" x={128} y={264} w={16} h={20} variant="math" className="justify-center">V</Text>
  <Arrow from="sdpa-q" to="sdpa-mm1@bottom:20px" />
  <Arrow from="sdpa-k" to="sdpa-mm1@bottom:76px" />
  <Arrow from="sdpa-mm1" to="sdpa-scale" />
  <Arrow from="sdpa-scale" to="sdpa-mask" />
  <Arrow from="sdpa-mask" to="sdpa-softmax" />
  <Arrow from="sdpa-softmax" to="sdpa-mm2@bottom:16px" />
  <Arrow from="sdpa-v" to="sdpa-mm2@bottom:80px" />
</>`;

const swiglu = j`<>
  <Arrow from="swiglu-w2" to={[110, 0]} />
  <Box id="swiglu" x={0} y={24} w={220} h={212} variant="panel-sky">
    SwiGLU
    <Box id="swiglu-w2" x={56} y={36} w={108} h={28} variant="violet">Linear <Math tex="W_2" /></Box>
    <Op id="swiglu-gate" x={102} y={84} w={16} h={16} symbol="x" />
    <Box id="swiglu-silu" x={16} y={124} w={88} h={28} variant="green">SiLU</Box>
    <Box id="swiglu-w1" x={16} y={168} w={88} h={28} variant="violet">Linear <Math tex="W_1" /></Box>
    <Box id="swiglu-w3" x={116} y={168} w={88} h={28} variant="violet">Linear <Math tex="W_3" /></Box>
    <Arrow from="swiglu-w1" to="swiglu-silu" />
    <Arrow from="swiglu-silu" to="swiglu-gate@left" via={[[60, 92]]} />
    <Arrow from="swiglu-w3" to="swiglu-gate@right" via={[[160, 92]]} />
    <Arrow from="swiglu-gate" to="swiglu-w2" />
  </Box>
  <Text id="swiglu-x" x={100} y={268} w={20} h={20} variant="math" className="justify-center">x</Text>
  <Arrow id="swiglu-in" from="swiglu-x" to={[110, 244]} head="none" />
  <Arrow from="swiglu-in@1" to="swiglu-w1" via={[[60, 244]]} />
  <Arrow from="swiglu-in@1" to="swiglu-w3" via={[[160, 244]]} />
</>`;

const moe = j`<>
${vector([3, 3], { id: "moe-out", x: 108, y: 0 })}
  <Op id="moe-sum" x={160} y={48} w={16} h={16} />
  <Box id="moe-s1" x={0} y={96} w={40} h={32} variant="green">1</Box>
  <Text x={44} y={104} w={16} h={16} variant="label" className="justify-center">…</Text>
  <Box id="moe-s2" x={64} y={96} w={40} h={32} variant="green"><Math tex="N_s" /></Box>
  <Box id="moe-r1" x={136} y={96} w={40} h={32} variant="muted">1</Box>
  <Box id="moe-r2" x={184} y={96} w={40} h={32} variant="sky">2</Box>
  <Box id="moe-r3" x={232} y={96} w={40} h={32} variant="muted">3</Box>
  <Text x={276} y={104} w={16} h={16} variant="label" className="justify-center">…</Text>
  <Box id="moe-r4" x={296} y={96} w={40} h={32} variant="sky"><Math tex="N_r" /></Box>
  <Box id="moe-router" x={204} y={160} w={64} h={24} variant="fuchsia">Router</Box>
  <Text x={272} y={164} w={48} h={16} variant="label">top-<i>k</i></Text>
${vector([3, 3], { id: "moe-in", x: 108, y: 240 })}
  <Arrow id="moe-bus" from={[20, 212]} to={[236, 212]} head="none" />
  <Arrow from="moe-in" to="moe-bus@0.685" />
  <Arrow from="moe-bus@0" to="moe-s1" />
  <Arrow from="moe-bus@0.296" to="moe-s2" />
  <Arrow from="moe-bus@1" to="moe-router" />
  <Arrow from="moe-router@top" to="moe-r2@bottom" route="straight" />
  <Arrow from="moe-router@top" to="moe-r4@bottom" route="straight" />
  <Arrow from="moe-router@top" to="moe-r1@bottom" route="straight" variant="muted" dashed />
  <Arrow from="moe-router@top" to="moe-r3@bottom" route="straight" variant="muted" dashed />
  <Arrow from="moe-s1" to="moe-sum" route="straight" />
  <Arrow from="moe-s2" to="moe-sum" route="straight" />
  <Arrow from="moe-r2" to="moe-sum" route="straight" />
  <Arrow from="moe-r4" to="moe-sum" route="straight" />
  <Arrow from="moe-sum" to="moe-out" />
  <Box x={268} y={4} w={20} h={12} variant="green" />
  <Text x={296} y={0} w={96} h={20} variant="label">shared expert</Text>
  <Box x={268} y={28} w={20} h={12} variant="sky" />
  <Text x={296} y={24} w={96} h={20} variant="label">routed expert</Text>
</>`;

const resblock = j`<>
  <Arrow from="res-relu2" to={[112, 0]} />
  <Box id="res-relu2" x={40} y={24} w={144} h={24} variant="green">ReLU</Box>
  <Op id="res-add" x={104} y={68} w={16} h={16} />
  <Box id="res-bn2" x={40} y={104} w={144} h={24} variant="yellow">BatchNorm</Box>
  <Box id="res-conv2" x={40} y={144} w={144} h={28} variant="teal">Conv 3×3</Box>
  <Box id="res-relu1" x={40} y={188} w={144} h={24} variant="green">ReLU</Box>
  <Box id="res-bn1" x={40} y={228} w={144} h={24} variant="yellow">BatchNorm</Box>
  <Box id="res-conv1" x={40} y={268} w={144} h={28} variant="teal">Conv 3×3</Box>
  <Text id="res-x" x={104} y={340} w={16} h={20} variant="math" className="justify-center">x</Text>
  <Arrow id="res-in" from="res-x" to="res-conv1" />
  <Arrow from="res-conv1" to="res-bn1" />
  <Arrow from="res-bn1" to="res-relu1" />
  <Arrow from="res-relu1" to="res-conv2" />
  <Arrow from="res-conv2" to="res-bn2" />
  <Arrow from="res-bn2" to="res-add" />
  <Arrow from="res-add" to="res-relu2" />
  <Arrow from="res-in@0.545" to="res-add@right" via={[[220, 316], [220, 76]]} variant="muted" labelAt={0.5}>identity</Arrow>
</>`;

const unet = j`<>
  <Box id="un-1" x={0} y={24} w={8} h={112} variant="blue" className="rounded-none" />
  <Box id="un-2" x={28} y={24} w={12} h={112} variant="blue" className="rounded-none" />
  <Box id="un-3" x={32} y={168} w={16} h={72} variant="blue" className="rounded-none" />
  <Box id="un-4" x={68} y={168} w={16} h={72} variant="blue" className="rounded-none" />
  <Box id="un-5" x={68} y={272} w={24} h={40} variant="blue" className="rounded-none" />
  <Box id="un-6" x={112} y={272} w={24} h={40} variant="blue" className="rounded-none" />
  <Box id="un-7" x={116} y={168} w={16} h={72} variant="blue" className="rounded-none" />
  <Box id="un-8" x={152} y={168} w={16} h={72} variant="blue" className="rounded-none" />
  <Box id="un-9" x={152} y={24} w={12} h={112} variant="blue" className="rounded-none" />
  <Box id="un-10" x={184} y={24} w={12} h={112} variant="blue" className="rounded-none" />
  <Box id="un-11" x={216} y={24} w={8} h={112} variant="blue" className="rounded-none" />
  <Text x={20} y={4} w={28} h={16} variant="label" className="justify-center">64</Text>
  <Text x={60} y={148} w={32} h={16} variant="label" className="justify-center">128</Text>
  <Text x={68} y={316} w={68} h={16} variant="label" className="justify-center">256</Text>
  <Text x={208} y={4} w={24} h={16} variant="label" className="justify-center">2</Text>
  <Arrow from="un-1" to="un-2" variant="blue" />
  <Arrow from="un-3" to="un-4" variant="blue" />
  <Arrow from="un-5" to="un-6" variant="blue" />
  <Arrow from="un-7" to="un-8" variant="blue" />
  <Arrow from="un-9" to="un-10" variant="blue" />
  <Arrow from="un-10" to="un-11" variant="teal" />
  <Arrow from="un-2" to="un-3" variant="red" />
  <Arrow from="un-4" to="un-5" variant="red" />
  <Arrow from="un-6" to="un-7" variant="green" />
  <Arrow from="un-8" to="un-9" variant="green" />
  <Arrow from="un-2" to="un-9" variant="muted" className="stroke-3" />
  <Arrow from="un-4" to="un-7" variant="muted" className="stroke-3" />
  <Arrow from={[264, 188]} to={[296, 188]} variant="blue" />
  <Text x={304} y={180} w={112} h={16} variant="label">conv 3×3, ReLU</Text>
  <Arrow from={[264, 212]} to={[296, 212]} variant="muted" className="stroke-3" />
  <Text x={304} y={204} w={112} h={16} variant="label">copy and crop</Text>
  <Arrow from={[264, 236]} to={[296, 236]} variant="red" />
  <Text x={304} y={228} w={112} h={16} variant="label">max pool 2×2</Text>
  <Arrow from={[264, 260]} to={[296, 260]} variant="green" />
  <Text x={304} y={252} w={112} h={16} variant="label">up-conv 2×2</Text>
  <Arrow from={[264, 284]} to={[296, 284]} variant="teal" />
  <Text x={304} y={276} w={112} h={16} variant="label">conv 1×1</Text>
</>`;

const vaeX = mediaImage("dog", { x: 0, y: 44, w: 56, h: 56 });
const vaeXhat = mediaImage("dog", { x: 440, y: 44, w: 56, h: 56 });
const vae = j`<>
  ${vaeX.jsx.replace("<Image ", '<Image id="vae-x" ')}
  <Box id="vae-enc" x={88} y={0} w={72} h={144} shape="trapezoid" narrow="right" inset={0.25} variant="blue">Encoder</Box>
  <Box id="vae-mu" x={192} y={36} w={40} h={28} variant="emerald"><Math tex="\mu" /></Box>
  <Box id="vae-sigma" x={192} y={80} w={40} h={28} variant="emerald"><Math tex="\sigma" /></Box>
  <Box id="vae-z" x={264} y={52} w={40} h={40} variant="emerald" className="font-semibold"><Math tex="z" /></Box>
  <Box id="vae-dec" x={336} y={0} w={72} h={144} shape="trapezoid" narrow="left" inset={0.25} variant="blue">Decoder</Box>
  ${vaeXhat.jsx.replace("<Image ", '<Image id="vae-xhat" ')}
  <Text x={0} y={104} w={56} h={20} variant="math" className="justify-center">x</Text>
  <Text x={440} y={104} w={56} h={20} className="justify-center"><Math tex="\hat{x}" /></Text>
  <Arrow from="vae-x" to="vae-enc" />
  <Arrow from="vae-enc" to="vae-mu" />
  <Arrow from="vae-enc" to="vae-sigma" />
  <Arrow from="vae-mu" to="vae-z" />
  <Arrow from="vae-sigma" to="vae-z" />
  <Arrow from="vae-z" to="vae-dec" />
  <Arrow from="vae-dec" to="vae-xhat" />
</>`;

const ganFake = mediaImage("face-2", { x: 176, y: 24, w: 48, h: 48 });
const ganReal = mediaImage("face", { x: 176, y: 104, w: 48, h: 48 });
const gan = j`<>
  <Box id="gan-z" x={0} y={28} w={40} h={40} variant="gray"><Math tex="z" /></Box>
  <Box id="gan-g" x={64} y={8} w={88} h={80} shape="trapezoid" narrow="left" inset={0.2} variant="blue">Generator</Box>
  ${ganFake.jsx.replace("<Image ", '<Image id="gan-fake" ')}
  ${ganReal.jsx.replace("<Image ", '<Image id="gan-real" ')}
  <Text x={168} y={4} w={64} h={16} variant="label" className="justify-center">generated</Text>
  <Text x={168} y={156} w={64} h={16} variant="label" className="justify-center">real data</Text>
  <Box id="gan-d" x={256} y={36} w={112} h={104} shape="trapezoid" narrow="right" inset={0.2} variant="violet">Discriminator</Box>
  <Box id="gan-out" x={400} y={72} w={80} h={32} variant="green">real / fake</Box>
  <Arrow from="gan-z" to="gan-g" />
  <Arrow from="gan-g" to="gan-fake" />
  <Arrow from="gan-fake" to="gan-d@left:12px" />
  <Arrow from="gan-real" to="gan-d@left:92px" />
  <Arrow from="gan-d" to="gan-out" />
</>`;

const difSteps = ["astronaut", "astronaut-noisy-1", "astronaut-noisy-2", "noise"].map((id, i) => mediaImage(id, { x: i * 104, y: 32, w: 88, h: 88 }));
const diffusion = j`<>
  <Arrow from={[0, 12]} to={[400, 12]} variant="muted">Forward diffusion <Math tex="q(x_t \mid x_{t-1})" /></Arrow>
${difSteps.map((im) => "  " + im.jsx).join("\n")}
  <Text x={0} y={124} w={88} h={20} className="justify-center"><Math tex="x_0" /></Text>
  <Text x={104} y={124} w={88} h={20} className="justify-center"><Math tex="x_{t-1}" /></Text>
  <Text x={208} y={124} w={88} h={20} className="justify-center"><Math tex="x_t" /></Text>
  <Text x={312} y={124} w={88} h={20} className="justify-center"><Math tex="x_T" /></Text>
  <Arrow from={[400, 160]} to={[0, 160]}>Reverse denoising <Math tex="p_\theta(x_{t-1} \mid x_t)" /></Arrow>
</>`;

const ldmX = mediaImage("dog", { x: 16, y: 32, w: 56, h: 56 });
const ldmXt = mediaImage("dog", { x: 16, y: 140, w: 56, h: 56 });
const ldm = j`<>
  <Box id="ldm-pixel" x={0} y={0} w={168} h={216} variant="panel-rose">
    Pixel space
    ${ldmX.jsx.replace("<Image ", '<Image id="ldm-x" ')}
    ${ldmXt.jsx.replace("<Image ", '<Image id="ldm-xt" ')}
    <Box id="ldm-e" x={88} y={24} w={64} h={72} shape="trapezoid" narrow="right" inset={0.2} variant="blue"><Math tex="\mathcal{E}" /></Box>
    <Box id="ldm-d" x={88} y={132} w={64} h={72} shape="trapezoid" narrow="left" inset={0.2} variant="blue"><Math tex="\mathcal{D}" /></Box>
    <Arrow from="ldm-x" to="ldm-e" />
    <Arrow from="ldm-d" to="ldm-xt" />
  </Box>
  <Box id="ldm-latent" x={184} y={0} w={384} h={216} variant="panel-emerald">
    Latent space
    <Box id="ldm-z" x={16} y={24} w={16} h={72} variant="emerald" />
    <Box id="ldm-proc" x={64} y={48} w={248} h={24} variant="muted">Diffusion process</Box>
    <Box id="ldm-zT" x={352} y={24} w={16} h={72} variant="emerald" />
    <Box id="ldm-z0" x={16} y={132} w={16} h={72} variant="emerald" />
    <Box id="ldm-unet" x={88} y={124} w={200} h={84} variant="panel-blue" className="text-[12px]">
      Denoising U-Net <Math tex="\epsilon_\theta" />
      <Box id="ldm-unet-down" x={16} y={28} w={76} h={48} shape="trapezoid" narrow="right" inset={0.2} variant="blue" />
      <Box id="ldm-unet-up" x={108} y={28} w={76} h={48} shape="trapezoid" narrow="left" inset={0.2} variant="blue" />
      <Arrow from="ldm-unet-down@right" to="ldm-unet-up@left" head="none" />
    </Box>
    <Text x={300} y={128} w={40} h={16} variant="label"><Math tex="\times T" /></Text>
    <Arrow from="ldm-z" to="ldm-proc" />
    <Arrow from="ldm-proc" to="ldm-zT" />
    <Arrow from="ldm-zT" to="ldm-unet@right" via={[[360, 166]]} />
    <Arrow from="ldm-unet" to="ldm-z0" />
  </Box>
  <Arrow from="ldm-e" to="ldm-z" />
  <Arrow from="ldm-z0" to="ldm-d" />
  <Box id="ldm-tau" x={388} y={248} w={88} h={40} shape="trapezoid" narrow="top" inset={0.15} variant="slate"><Math tex="\tau_\theta" /></Box>
  <Text id="ldm-prompt" x={492} y={256} w={64} h={24} variant="label">“a dog”</Text>
  <Arrow from="ldm-prompt" to="ldm-tau" />
  <Arrow from="ldm-tau" to="ldm-unet@bottom:160px" variant="indigo" dashed>cross-attention</Arrow>
</>`;

const vitImg = mediaImage("bird-patches", { x: 0, y: 224, w: 72, h: 72 });
const vitPairs = Array.from({ length: 7 }, (_, k) => {
  const x = 112 + 56 * k;
  return j`  <Group id="vit-p${k}" x={${x}} y={184} w={32} h={32}>
    <Box x={0} y={0} w={16} h={32} variant="violet" className="rounded-full p-0">${k}</Box>
    <Box x={16} y={0} w={16} h={32} variant="pink" className="rounded-full p-0">${k === 0 ? "*" : ""}</Box>
  </Group>`;
}).join("\n");
const vit = j`<>
  <Box id="vit-class" x={96} y={0} w={80} h={32} variant="green">Class</Box>
  <Box id="vit-head" x={96} y={48} w={80} h={32} variant="orange">MLP head</Box>
  <Box id="vit-enc" x={96} y={104} w={400} h={56} variant="gray">Transformer Encoder</Box>
${vitPairs}
  <Box id="vit-proj" x={152} y={240} w={344} h={32} variant="pink">Linear Projection of Flattened Patches</Box>
  ${vitImg.jsx.replace("<Image ", '<Image id="vit-img" ')}
  <Text x={0} y={192} w={104} h={16} variant="label">* [class] token</Text>
  <Arrow from="vit-img" to="vit-proj" />
${Array.from({ length: 6 }, (_, k) => `  <Arrow from="vit-proj@top:${16 + 56 * (k + 1) - 40}px" to="vit-p${k + 1}" />`).join("\n")}
${Array.from({ length: 7 }, (_, k) => `  <Arrow from="vit-p${k}" to="vit-enc@bottom:${32 + 56 * k}px" />`).join("\n")}
  <Arrow from="vit-enc@top:40px" to="vit-head" />
  <Arrow from="vit-head" to="vit-class" />
</>`;

const clipCells = (r: number) =>
  ["1", "2", "3", "…", "N"]
    .map((col, c) => {
      const i = ["1", "2", "3", "⋮", "N"][r];
      const text = col === "…" || i === "⋮" ? (r === c ? "⋱" : col === "…" ? "…" : "⋮") : `I<sub>${i}</sub>·T<sub>${col}</sub>`;
      return `<Cell${r === c ? ' variant="blue"' : ""}>${text}</Cell>`;
    })
    .join("");
const clipImgs = [mediaImage("bird", { x: 8, y: 152, w: 72, h: 72 }), mediaImage("cat", { x: 4, y: 156, w: 72, h: 72 }), mediaImage("dog", { x: 0, y: 160, w: 72, h: 72 })];
const clip = j`<>
  <Box x={8} y={0} w={104} h={56} />
  <Box x={4} y={4} w={104} h={56} />
  <Box id="clip-text" x={0} y={8} w={104} h={56} className="items-start justify-start p-2 text-left font-mono text-[11px]">a photo of<br />a dog</Box>
  <Box id="clip-tenc" x={136} y={0} w={104} h={72} shape="trapezoid" narrow="right" inset={0.2} variant="violet">Text<br />Encoder</Box>
  <Arrow id="clip-tline" from="clip-tenc" to={[520, 36]} head="none" />
${[0, 1, 2, 3, 4].map((c) => `  <Arrow from="clip-tline@${((328 + 48 * c - 240) / 280).toFixed(3)}" to="clip-t@top:${24 + 48 * c}px" />`).join("\n")}
  <Table id="clip-t" x={304} y={96} w={240} h={28} variant="violet">
    <Row><Cell>T<sub>1</sub></Cell><Cell>T<sub>2</sub></Cell><Cell>T<sub>3</sub></Cell><Cell>…</Cell><Cell>T<sub>N</sub></Cell></Row>
  </Table>
${clipImgs.map((im) => "  " + im.jsx).join("\n")}
  <Box id="clip-ienc" x={104} y={152} w={104} h={80} shape="trapezoid" narrow="right" inset={0.2} variant="green">Image<br />Encoder</Box>
  <Table id="clip-i" x={248} y={132} w={36} h={140} variant="green">
    <Row><Cell>I<sub>1</sub></Cell></Row>
    <Row><Cell>I<sub>2</sub></Cell></Row>
    <Row><Cell>I<sub>3</sub></Cell></Row>
    <Row><Cell>⋮</Cell></Row>
    <Row><Cell>I<sub>N</sub></Cell></Row>
  </Table>
  <Table id="clip-sim" x={304} y={132} w={240} h={140} className="text-[12px]">
${[0, 1, 2, 3, 4].map((r) => `    <Row>${clipCells(r)}</Row>`).join("\n")}
  </Table>
  <Arrow from="clip-ienc" to="clip-i" />
</>`;

const training = j`<>
  <Box id="tr-opt" x={152} y={0} w={96} h={28} variant="muted">Optimizer</Box>
  <Box id="tr-data" x={0} y={64} w={72} h={80} shape="cylinder">Dataset</Box>
  <Box id="tr-model" x={136} y={80} w={128} h={48} variant="blue">Model <Math tex="f_\theta" /></Box>
  <Box id="tr-loss" x={328} y={88} w={96} h={32} variant="red">Loss <Math tex="\mathcal{L}" /></Box>
  <Arrow from="tr-data" to="tr-model"><Math tex="x" /></Arrow>
  <Arrow from="tr-model" to="tr-loss"><Math tex="\hat{y}" /></Arrow>
  <Arrow from="tr-data@bottom" to="tr-loss@bottom" via={[[36, 176], [376, 176]]} variant="muted"><Math tex="y" /></Arrow>
  <Arrow from="tr-loss@top" to="tr-opt@right" via={[[376, 14]]} variant="red" dashed><Math tex="\nabla_\theta \mathcal{L}" /></Arrow>
  <Arrow from="tr-opt" to="tr-model" variant="red" dashed>update</Arrow>
</>`;

const rl = j`<>
  <Box id="rl-agent" x={96} y={0} w={136} h={48} variant="sky" className="pl-9">
    Agent
    <Icon x={8} y={12} w={24} h={24} name="bot" />
  </Box>
  <Box id="rl-env" x={96} y={120} w={136} h={48} variant="green" className="pl-9">
    Environment
    <Icon x={8} y={12} w={24} h={24} name="globe" />
  </Box>
  <Arrow from="rl-agent@right" to="rl-env@right" via={[[300, 24], [300, 144]]}>action <Math tex="a_t" /></Arrow>
  <Arrow from="rl-env@left" to="rl-agent@left" via={[[28, 144], [28, 24]]}>state <Math tex="s_t" />, reward <Math tex="r_t" /></Arrow>
</>`;

const rag = j`<>
  <Box id="rag-q" x={0} y={44} w={80} h={32}>
    Query
  </Box>
  <Box id="rag-emb" x={112} y={44} w={88} h={32} variant="pink">Embed</Box>
  <Box id="rag-db" x={232} y={28} w={80} h={64} shape="cylinder" variant="gray">Vector<br />store</Box>
  <Box x={352} y={36} w={72} h={44} />
  <Box id="rag-docs" x={348} y={40} w={72} h={44} className="text-[11px]">top-k<br />documents</Box>
  <Box id="rag-llm" x={460} y={40} w={72} h={44} variant="orange" className="font-semibold">LLM</Box>
  <Box id="rag-out" x={564} y={44} w={80} h={32} variant="green">Answer</Box>
  <Arrow from="rag-q" to="rag-emb" />
  <Arrow from="rag-emb" to="rag-db" />
  <Arrow from="rag-db" to="rag-docs" />
  <Arrow from="rag-docs" to="rag-llm" />
  <Arrow from="rag-llm" to="rag-out" />
  <Arrow from="rag-q@top" to="rag-llm@top" via={[[40, 8], [496, 8]]} variant="muted">prompt</Arrow>
</>`;

const zoom = j`<>
  <Box id="zm-block" x={0} y={40} w={136} h={128} variant="panel-blue" className="border-dashed">
    Block ×L
    <Box x={16} y={36} w={104} h={28} variant="sky">FFN</Box>
    <Box id="zm-src" x={16} y={84} w={104} h={28} variant="orange">Attention</Box>
  </Box>
  <Box id="zm-detail" x={216} y={0} w={216} h={208} variant="panel-blue" className="border-dashed">
    Attention
    <Box x={16} y={40} w={184} h={28} variant="violet">Output projection</Box>
    <Box x={16} y={96} w={184} h={32} variant="orange">Scaled dot-product</Box>
    <Box x={16} y={160} w={56} h={28} variant="violet"><Math tex="W_Q" /></Box>
    <Box x={80} y={160} w={56} h={28} variant="violet"><Math tex="W_K" /></Box>
    <Box x={144} y={160} w={56} h={28} variant="violet"><Math tex="W_V" /></Box>
  </Box>
  <Arrow from="zm-src@top-right" to="zm-detail@top-left" route="straight" head="none" variant="blue" dashed />
  <Arrow from="zm-src@bottom-right" to="zm-detail@bottom-left" route="straight" head="none" variant="blue" dashed />
</>`;

/** The color conventions as a legend, two columns. */
const LEGEND: [string, string][] = [
  ["orange", "Attention"],
  ["sky", "Feed-forward, MLP"],
  ["yellow", "Normalization"],
  ["pink", "Embedding"],
  ["violet", "Linear, head"],
  ["green", "Activation, softmax"],
  ["teal", "Convolution"],
  ["cyan", "Pooling, resampling"],
  ["purple", "Recurrent"],
  ["fuchsia", "Router, gate"],
  ["indigo", "Conditioning"],
  ["red", "Loss"],
  ["blue", "Encoder, decoder"],
  ["emerald", "Latent"],
  ["slate", "Frozen"],
  ["amber", "Text tokens"],
];
const legend = `<Group x={0} y={0} w={296} h={${Math.ceil(LEGEND.length / 2) * 20}}>
${LEGEND.map(([v, label], i) => {
  const x = i < LEGEND.length / 2 ? 0 : 152;
  const y = (i % Math.ceil(LEGEND.length / 2)) * 20;
  return `  <Box x={${x}} y={${y + 4}} w={20} h={12} variant="${v}" />\n  <Text x={${x + 28}} y={${y}} w={116} h={20} variant="label">${label}</Text>`;
}).join("\n")}
</Group>`;

const arrowLegend = `<Group x={0} y={0} w={200} h={116}>
  <Arrow from={[0, 8]} to={[40, 8]} />
  <Text x={52} y={0} w={148} h={16} variant="label">data flow</Text>
  <Arrow from={[0, 32]} to={[40, 32]} variant="muted" />
  <Text x={52} y={24} w={148} h={16} variant="label">residual / skip</Text>
  <Arrow from={[0, 56]} to={[40, 56]} variant="indigo" dashed />
  <Text x={52} y={48} w={148} h={16} variant="label">conditioning</Text>
  <Arrow from={[0, 80]} to={[40, 80]} variant="red" dashed />
  <Text x={52} y={72} w={148} h={16} variant="label">gradient / loss</Text>
  <Arrow from={[0, 104]} to={[40, 104]} variant="muted" className="stroke-3" />
  <Text x={52} y={96} w={148} h={16} variant="label">copy (long skip)</Text>
</Group>`;

export const BLOCKS_SECTION: LibrarySection = {
  id: "ml-blocks",
  title: "Blocks",
  size: "large",
  items: [
    item("transformer", "Transformer layer", vaswaniEncoder, "encoder attention is all you need post-norm add norm vaswani"),
    item("decoder-block", "Decoder block (pre-norm)", preNormBlock, "llm gpt llama rmsnorm residual causal"),
    item("multi-head", "Multi-head attention", multiHead, "mha qkv heads concat"),
    item("sdpa", "Scaled dot-product attention", sdpa, "matmul softmax mask scale qkv"),
    item("swiglu", "SwiGLU FFN", swiglu, "mlp gated glu feed forward"),
    item("moe", "Mixture of experts", moe, "moe experts routing router shared top-k sparse deepseek"),
    item("resblock", "Residual block", resblock, "resnet conv batchnorm relu identity skip"),
    item("unet-block", "U-Net", unet, "segmentation encoder decoder skip copy crop max pool up-conv"),
    item("vae", "VAE", vae, "variational autoencoder latent mu sigma", mergeAssets(vaeX.assets, vaeXhat.assets)),
    item("gan", "GAN", gan, "generator discriminator adversarial", mergeAssets(ganFake.assets, ganReal.assets)),
    item("diffusion", "Diffusion", diffusion, "ddpm denoising forward reverse noise", mergeAssets(...difSteps.map((i) => i.assets))),
    item("ldm", "Latent diffusion", ldm, "stable diffusion ldm latent unet cross-attention conditioning", mergeAssets(ldmX.assets, ldmXt.assets)),
    item("vit", "Vision Transformer", vit, "vit patches class token position embedding image classification", vitImg.assets),
    item("clip", "CLIP (contrastive)", clip, "contrastive image text encoder similarity matrix zero-shot", mergeAssets(...clipImgs.map((i) => i.assets))),
    item("training", "Training loop", training, "loss optimizer gradient backprop dataset"),
    item("rl", "RL loop", rl, "reinforcement learning agent environment reward action state"),
    item("rag", "RAG pipeline", rag, "retrieval augmented generation vector database llm embedding"),
    item("zoom-detail", "Zoom-in detail", zoom, "detail expand inset dashed panel magnify"),
    item("legend", "Color legend", legend, "legend key colors conventions"),
    item("arrow-legend", "Arrow legend", arrowLegend, "legend key arrows lines"),
  ],
};
