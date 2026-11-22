// Iris-3B: pixel-space flow-matching transformer, redrawn after Fig. 4 of the paper.
// Left: the full model. Top right: a PiT block of the pixel head. Bottom right: a trunk block.
<Diagram width={1224} height={764} grid={4} title="Iris-3B architecture">
  {/* zoom lines from the overview to the detail panels */}
  <Arrow from="pit@top-right" to="pit-detail@top-left" route="straight" head="none" variant="muted" className="[--nnd-dash:1.5_3]" dashed />
  <Arrow from="pit@bottom-right" to="pit-detail@bottom-left" route="straight" head="none" variant="muted" className="[--nnd-dash:1.5_3]" dashed />
  <Arrow from="trunk@top-right" to="attention@top-left" route="straight" head="none" variant="muted" className="[--nnd-dash:1.5_3]" dashed />
  <Arrow from="trunk@bottom-right" to="attention@bottom-left" route="straight" head="none" variant="muted" className="[--nnd-dash:1.5_3]" dashed />

  {/* ---------- overview: output ---------- */}
  <Box id="outproj" x={60} y={72} w={160} h={28} tip={`Projects every pixel token back to the RGB values of its pixel. Put together, the outputs of all patches form a full-resolution image: the predicted velocity.`}>Output projection</Box>
  <Box id="vtheta" x={260} y={72} w={136} h={28} variant="green" tip={`The prediction: a **velocity** for every pixel. Rectified flow mixes a clean image $x_0$ and noise $\epsilon$ along a straight line, $x_t = (1-t)\,x_0 + t\,\epsilon$. The velocity along that line is constant, $v = \epsilon - x_0$, and the model learns it with a plain mean-squared error.

To generate, start from pure noise ($t = 1$) and take small steps against the predicted velocity until $t = 0$: 100 steps with classifier-free guidance 3 by default, 4 steps for the distilled Iris-3B Turbo.`}>
    <Math tex="v_\theta(x_t, t, y)" />
  </Box>
  <Group id="legend" x={428} y={64} w={156} h={44}>
    <Box x={0} y={4} w={12} h={12} variant="amber" className="rounded-[2px]" />
    <Text x={16} y={0} w={32} h={20} variant="label">text</Text>
    <Box x={52} y={4} w={12} h={12} variant="blue" className="rounded-[2px]" />
    <Text x={68} y={0} w={40} h={20} variant="label">image</Text>
    <Box x={112} y={4} w={12} h={12} variant="rose" className="rounded-[2px]" />
    <Text x={128} y={0} w={28} h={20} variant="label">pixel</Text>
    <Op x={0} y={28} w={12} h={12} symbol="concat" />
    <Text x={16} y={24} w={44} h={20} variant="label">concat</Text>
    <Op x={64} y={28} w={12} h={12} symbol="c" variant="indigo" />
    <Text x={80} y={24} w={76} h={20} variant="label">conditioning</Text>
  </Group>

  {/* ---------- overview: PiT head ---------- */}
  <Box id="pit" x={44} y={124} w={528} h={84} variant="panel-rose" tip={`The **PiT head** (pixel transformer, taken from PixelDiT): 4 blocks that turn each 16×16 patch token of the trunk back into its 256 pixels.

It replaces the VAE decoder of latent diffusion models. Iris never compresses the image into a latent, so there is no separately trained autoencoder and no reconstruction error that limits fine detail.`}>
    PiT block
    <Text x={476} y={8} w={40} h={20} variant="label" className="justify-end">×4</Text>
    <Box id="pit-row" x={24} y={44} w={232} h={24} tip={`**Pixel tokens**: one token per pixel. They are grouped by patch, 256 per 16×16 patch.`}>
      <Tokens x={4} y={4} w={224} h={16} segments={["pixel:7", "...", "pixel:7"]} />
    </Box>
    <Box id="adaln" x={348} y={44} w={132} h={24} variant="indigo" tip={`**Pixel-wise adaLN**: the semantic token of a patch is projected into a separate scale, shift and gate for **each** of its 256 pixels. The patch-level content (what belongs here) can then steer every pixel individually, instead of nudging all pixels of a patch in the same way.`}>Pixel-wise adaLN</Box>
  </Box>
  <Box id="patch1" x={76} y={228} w={128} h={24} variant="rose" tip={`**1×1 patchify**: every pixel of the noisy image becomes its own token (a small linear embedding of its RGB value). The pixel tokens of each 16×16 patch are kept together, so the PiT head can work patch by patch.`}>1×1 patchify</Box>
  <Box id="semantic" x={388} y={228} w={140} h={24} variant="blue" className="font-semibold" tip={`The **semantic token**: the trunk's output for one 16×16 patch, combined with the timestep embedding. It encodes *what* this patch should contain (object, color, layout, how it fits the prompt); the PiT head decides *how* its 256 pixels realize it.`}>Semantic token</Box>

  {/* ---------- overview: trunk ---------- */}
  <Box id="trunk" x={44} y={276} w={528} h={172} variant="panel-blue" tip={`The **trunk**: a 2560-wide diffusion transformer over 16×16 patches (a 64×64 grid of image tokens at 1024×1024). 8 dual-stream blocks are followed by 16 single-stream blocks, the hybrid layout of FLUX.1. The bottom-right panels show what is inside one block.`}>
    <Box id="single" x={12} y={8} w={504} h={72} className="items-start justify-start px-3 py-1.5 font-semibold" tip={`**Single-stream blocks**: text and image tokens are concatenated into one sequence and processed with **shared weights**, like a plain transformer. Cheaper than dual-stream, so it is used for the deeper 16 blocks, once both modalities live in a common space.`}>
      Single-stream block
      <Text x={448} y={8} w={40} h={20} variant="label" className="justify-end">×16</Text>
      <Box id="single-row" x={12} y={36} w={368} h={24} tip={`One sequence: text tokens ⊙ image tokens.`}>
        <Tokens x={4} y={4} w={360} h={16} segments={["text:4", "...", "text:4", "concat", "image:5", "...", "image:5"]} />
      </Box>
    </Box>
    <Box id="dual" x={12} y={92} w={504} h={72} className="items-start justify-start px-3 py-1.5 font-semibold" tip={`**Dual-stream (MMDiT) blocks**: text and image tokens keep **separate weights** (their own projections, MLPs and modulation) but attend to each other in one joint attention (↔). Each modality keeps its own statistics in the early layers while information already flows between them.`}>
      Dual-stream block
      <Text x={448} y={8} w={40} h={20} variant="label" className="justify-end">×8</Text>
      <Box id="text-row" x={12} y={36} w={144} h={24} tip="Text tokens from the adapter.">
        <Tokens x={4} y={4} w={136} h={16} segments={["text:4", "...", "text:4"]} />
      </Box>
      <Box id="image-row" x={212} y={36} w={168} h={24} tip="Image tokens, one per 16×16 patch.">
        <Tokens x={4} y={4} w={160} h={16} segments={["image:5", "...", "image:5"]} />
      </Box>
      <Arrow from="text-row" to="image-row" tail="arrow" />
    </Box>
  </Box>

  {/* ---------- overview: inputs ---------- */}
  <Box id="adapter" x={56} y={468} w={168} h={44} variant="amber" tip={`The **text adapter** reads hidden states from **12 layers** of the frozen encoder, fuses them with attention pooling over the layers, and refines the result with **two transformer blocks**. Different layers of a language model hold different kinds of information (wording vs. meaning), so mixing several works better than using only the last one.`}>Text adapter<br /><span className="text-[12px]">2 transformer blocks</span></Box>
  <Box id="qwen" x={56} y={532} w={168} h={28} variant="cyan" className="pr-7" tip={`**Qwen3-VL-4B-Instruct**, a 4B vision-language model, encodes the prompt. It is **frozen** (not trained with Iris), which keeps its language understanding intact and makes training cheaper.`}>
    Qwen3-VL-4B
    <Icon x={140} y={4} w={20} h={20} name="snowflake" variant="sky" />
  </Box>
  <Box id="prompt" x={60} y={596} w={160} h={84} variant="panel-amber" className="rounded-[3px] font-normal leading-snug" tip="The prompt $y$.">A red fox curled up asleep in fresh snow, soft falling snowflakes</Box>
  <Text x={228} y={628} w={16} h={20} variant="math">y</Text>
  <Box id="patchify" x={268} y={532} w={168} h={28} variant="blue" tip={`Cuts the noisy image into **16×16 pixel patches**; each patch becomes one image token (4096 tokens at 1024×1024). Image tokens get **2D RoPE** (rotary position encoding along rows and columns). It has no parameters tied to a fixed size, so the same weights run at 256, 512 and 1024 px and at aspect ratios from 1:4 to 4:1.`}>Patchify</Box>
  <Image id="noisy" x={276} y={584} w={152} h={104} src="noisy-fox.svg" grid={[6, 4]} alt="Noisy image" tip={`The noisy image $x_t = (1-t)\,x_0 + t\,\epsilon$, a blend of a training image $x_0$ and Gaussian noise $\epsilon$. At generation time it starts as pure noise.`} />
  <Text x={436} y={624} w={20} h={20} variant="math">x<sub>t</sub></Text>
  <Box id="embed" x={452} y={532} w={96} h={28} variant="indigo" tip={`Embeds the noise level $t$ into the conditioning vector. Iris uses **shared-bias adaLN**: one shared projection per stream (image and text) turns it into the scales, shifts and gates of all blocks, and each block only adds small learned biases. At equal compute this has 28 % fewer parameters than a separate adaLN projection in every block.`}>Embed</Box>
  <Box id="timestep" x={452} y={624} w={96} h={28} variant="indigo" tip={`The noise level $t \in [0, 1]$. Training samples it from a logit-normal distribution shifted toward high noise, with a larger shift at higher resolution (2, 3 and 4 at 256, 512 and 1024 px): big images keep more structure at a given noise level, so they need more noise to train the coarse decisions.`}>Timestep <Math tex="t" /></Box>

  {/* ---------- overview: connections ---------- */}
  <Arrow from="prompt" to="qwen" />
  <Arrow from="qwen" to="adapter" />
  <Arrow from="adapter" to="text-row" />
  <Arrow from="noisy" to="patchify" />
  <Arrow from="patchify" to="image-row" />
  <Arrow from="dual@top:84px" to="single-row@bottom:72px" />
  <Arrow from="dual@top:296px" to="single-row@bottom:284px" />
  <Arrow from="single@top:296px" to="semantic@left" via={[[352, 240]]} />
  <Arrow from="semantic" to="adaln" />
  <Arrow from="noisy@bottom:16px" to="patch1@left" via={[[292, 712], [28, 712], [28, 240]]} />
  <Arrow from="patch1" to="pit-row@bottom:72px" />
  <Arrow from="pit-row@top:72px" to="outproj" />
  <Arrow from="outproj" to="vtheta" />
  <Arrow from="timestep" to="embed" />
  <Arrow id="cond" from="embed" to="semantic@bottom:112px" variant="indigo" dashed />
  <Arrow from="cond@0.414" to="image-row@right" variant="indigo" dashed />
  <Arrow from="cond@0.714" to="single-row@right" variant="indigo" dashed />
  <Arrow from="adaln" to="pit-row@right" variant="indigo" dashed />
  <Op x={456} y={408} w={16} h={16} symbol="c" variant="indigo" />
  <Op x={456} y={324} w={16} h={16} symbol="c" variant="indigo" />
  <Op x={340} y={172} w={16} h={16} symbol="c" variant="indigo" />

  {/* ---------- detail: PiT block ---------- */}
  <Text x={704} y={8} w={96} h={20} variant="label" className="justify-center">pixel tokens</Text>
  <Text x={872} y={8} w={96} h={20} variant="label" className="justify-center">semantic token</Text>
  <Box id="pit-detail" x={648} y={48} w={528} h={252} variant="panel-rose">
    <Text x={420} y={8} w={96} h={16} variant="caption" className="justify-end">PiT block</Text>
    <Box id="pit-rms1" x={20} y={28} w={168} h={24} variant="muted" tip="RMSNorm: rescales each pixel token by its root mean square (no mean subtraction).">RMSNorm</Box>
    <Box id="pit-compress" x={32} y={64} w={144} h={24} shape="trapezoid" narrow="bottom" inset={0.08} variant="rose" tip={`**Pixel token compaction**: the 256 pixel tokens of a patch are flattened and linearly projected into **one** 1280-wide token. Attention then runs over 4096 patch tokens instead of about a million pixel tokens at 1024×1024, a 256× shorter sequence.`}>Linear compress</Box>
    <Box id="pit-mhsa" x={48} y={100} w={112} h={24} variant="blue" className="font-semibold" tip={`Multi-head self-attention over the compacted patch tokens. It is **global**: every patch can look at every other patch, so neighboring patches agree on edges and textures across patch borders.`}>MHSA</Box>
    <Box id="pit-rope" x={172} y={100} w={48} h={24} tip="Rotary position embedding: encodes each patch's 2D position by rotating queries and keys.">RoPE</Box>
    <Box id="pit-expand" x={32} y={136} w={144} h={24} shape="trapezoid" narrow="top" inset={0.08} variant="rose" tip="Linear expansion back from one token per patch to its 256 pixel tokens.">Linear expand</Box>
    <Box id="pit-ss1" x={20} y={172} w={168} h={24} variant="indigo" tip="Per-pixel scale and shift from the semantic token (pixel-wise adaLN).">Scale &amp; shift</Box>
    <Op id="pit-add1" x={96} y={212} w={16} h={16} tip="Residual connection around the attention part." />
    <Box id="pit-linear" x={232} y={28} w={80} h={24} variant="indigo" tip={`Projects the semantic token into the modulation parameters: a separate scale and shift for each of the 256 pixels of the patch.`}>Linear</Box>
    <Op id="pit-add2" x={392} y={44} w={16} h={16} tip="Residual connection around the MLP part." />
    <Box id="pit-ss2" x={316} y={88} w={168} h={24} variant="indigo" tip="Per-pixel scale and shift from the semantic token (pixel-wise adaLN).">Scale &amp; shift</Box>
    <Box id="pit-mlp" x={316} y={128} w={168} h={24} variant="amber" className="font-semibold" tip={`MLP applied to **each pixel token on its own**. Cheap, because pixel tokens are small; it refines the pixel values after attention has exchanged information between patches.`}>MLP</Box>
    <Box id="pit-rms2" x={316} y={168} w={168} h={24} variant="muted" tip="RMSNorm at the input of the MLP part.">RMSNorm</Box>
    <Arrow from="pit-rms1" to="pit-compress" />
    <Arrow from="pit-compress" to="pit-mhsa" />
    <Arrow from="pit-rope" to="pit-mhsa" />
    <Arrow from="pit-mhsa" to="pit-expand" />
    <Arrow from="pit-expand" to="pit-ss1" />
    <Arrow from="pit-ss1" to="pit-add1" />
    <Arrow from="pit-in@0.75" to="pit-add1@left" via={[[8, 16], [8, 220]]} />
    <Arrow from="pit-add1@right" to="pit-rms2" via={[[400, 220]]} />
    <Arrow from={[400, 220]} to="pit-add2@right" via={[[508, 220], [508, 52]]} />
    <Arrow from="pit-rms2" to="pit-mlp" />
    <Arrow from="pit-mlp" to="pit-ss2" />
    <Arrow from="pit-ss2" to="pit-add2" />
    <Arrow id="pit-sem" from="pit-linear" to="pit-ss1@right" via={[[272, 184]]} variant="indigo" dashed />
    <Arrow from="pit-sem@0.2222" to="pit-ss2@left" variant="indigo" dashed />
  </Box>
  <Arrow id="pit-in" from={[752, 28]} to="pit-rms1" />
  <Arrow from={[920, 28]} to="pit-linear" variant="indigo" dashed />
  <Arrow from="pit-add2" to={[1048, 8]} />

  {/* ---------- detail: trunk attention ---------- */}
  <Box id="attention" x={648} y={332} w={264} h={376} variant="panel-blue">
    <Text x={152} y={8} w={96} h={16} variant="caption" className="justify-end">Attention</Text>
    <Op id="att-add" x={112} y={12} w={16} h={16} tip="Residual connection: the attention update is added to the token stream." />
    <Box id="att-gate" x={36} y={44} w={168} h={24} variant="indigo" tip={`**Gate** from the timestep conditioning: scales the whole update before it is added to the residual stream, so each block can turn its contribution up or down depending on the noise level.`}>Gate</Box>
    <Box id="att-rms1" x={36} y={80} w={168} h={24} variant="muted" tip={`RMSNorm on the *output* of the sub-block. With the RMSNorm at its input this is **sandwich normalization**: it keeps the updates added to the residual stream at a controlled size through all 24 blocks.`}>RMSNorm</Box>
    <Box id="att-out" x={36} y={116} w={168} h={24} tip="Output projection: mixes the results of all heads.">Output projection</Box>
    <Box id="att-sig" x={36} y={152} w={168} h={24} variant="rose" tip={`**Sigmoid output gate**: an input-dependent gate in $(0, 1)$ multiplied onto the attention output. A head can switch itself (nearly) off when it has nothing useful to add, instead of dumping attention on some token, which also makes training more stable.`}>Sigmoid gate</Box>
    <Box id="att-gqa" x={28} y={188} w={184} h={28} variant="blue" className="font-semibold" tip={`**Grouped-query attention** with 20 query heads and 5 key/value heads: every 4 query heads share one key/value head. Almost the quality of full multi-head attention with 4× fewer key/value projections. Text and image tokens attend jointly.`}>Grouped-query attention</Box>
    <Box id="att-qk" x={36} y={228} w={116} h={24} variant="muted" tip={`**QK-Norm** normalizes queries and keys, which keeps the attention logits bounded and training stable. **RoPE** then rotates them by the token's position (2D, by row and column, for image tokens).`}>QK-Norm · RoPE</Box>
    <Box id="att-q" x={36} y={264} w={56} h={24} variant="blue" tip="Queries: 20 heads.">Q</Box>
    <Box id="att-k" x={100} y={264} w={48} h={24} variant="blue" tip="Keys: 5 heads (shared by groups of 4 query heads).">K</Box>
    <Box id="att-v" x={156} y={264} w={48} h={24} variant="blue" tip="Values: 5 heads (shared by groups of 4 query heads).">V</Box>
    <Box id="att-ss" x={36} y={300} w={168} h={24} variant="indigo" tip={`**Scale & shift** (adaLN) from the timestep conditioning. It tells the block how noisy its input is, so the same weights can behave differently at high noise (global layout) and low noise (fine detail).`}>Scale &amp; shift</Box>
    <Box id="att-rms2" x={36} y={336} w={168} h={24} variant="muted" tip="RMSNorm at the input of the sub-block (pre-norm).">RMSNorm</Box>
    <Arrow from="att-rms2" to="att-ss" />
    <Arrow from="att-ss@top:28px" to="att-q" />
    <Arrow from="att-ss@top:88px" to="att-k" />
    <Arrow from="att-ss@top:144px" to="att-v" />
    <Arrow from="att-q" to="att-qk@bottom:28px" />
    <Arrow from="att-k" to="att-qk@bottom:88px" />
    <Arrow from="att-qk" to="att-gqa@bottom:66px" />
    <Arrow from="att-v" to="att-gqa@bottom:152px" />
    <Arrow from="att-gqa" to="att-sig" />
    <Arrow from="att-sig" to="att-out" />
    <Arrow from="att-out" to="att-rms1" />
    <Arrow from="att-rms1" to="att-gate" />
    <Arrow from="att-gate" to="att-add" />
    <Arrow from="att-in@0.778" to="att-add@left" via={[[12, 368], [12, 20]]} />
    <Op id="att-c1" x={220} y={48} w={16} h={16} symbol="c" variant="indigo" />
    <Op id="att-c2" x={220} y={304} w={16} h={16} symbol="c" variant="indigo" />
    <Arrow from="att-c1" to="att-gate" variant="indigo" dashed />
    <Arrow from="att-c2" to="att-ss" variant="indigo" dashed />
  </Box>
  <Arrow id="att-in" from={[768, 728]} to="att-rms2" />
  <Arrow from="att-add" to={[768, 316]} />

  {/* ---------- detail: trunk feed-forward ---------- */}
  <Box id="ffn" x={936} y={476} w={264} h={232} variant="panel-amber">
    <Text x={152} y={8} w={96} h={16} variant="caption" className="justify-end">Feed-forward</Text>
    <Op id="ffn-add" x={112} y={12} w={16} h={16} tip="Residual connection: the feed-forward update is added to the token stream." />
    <Box id="ffn-gate" x={36} y={44} w={168} h={24} variant="indigo" tip="Gate from the timestep conditioning, as in the attention part.">Gate</Box>
    <Box id="ffn-rms1" x={36} y={80} w={168} h={24} variant="muted" tip="Output RMSNorm (sandwich normalization).">RMSNorm</Box>
    <Box id="ffn-swiglu" x={36} y={116} w={168} h={24} variant="amber" className="font-semibold" tip={`**SwiGLU** feed-forward network, $(\mathrm{SiLU}(xW_1) \odot xW_3)\,W_2$, applied to each token separately. One branch computes a gate that decides, per hidden unit, how much of the other branch passes through.`}>SwiGLU FFN</Box>
    <Box id="ffn-ss" x={36} y={152} w={168} h={24} variant="indigo" tip="Scale & shift from the timestep conditioning (adaLN).">Scale &amp; shift</Box>
    <Box id="ffn-rms2" x={36} y={188} w={168} h={24} variant="muted" tip="Input RMSNorm (pre-norm).">RMSNorm</Box>
    <Arrow from="ffn-rms2" to="ffn-ss" />
    <Arrow from="ffn-ss" to="ffn-swiglu" />
    <Arrow from="ffn-swiglu" to="ffn-rms1" />
    <Arrow from="ffn-rms1" to="ffn-gate" />
    <Arrow from="ffn-gate" to="ffn-add" />
    <Arrow from="ffn-in@0.75" to="ffn-add@left" via={[[12, 222], [12, 20]]} />
    <Op id="ffn-c1" x={220} y={48} w={16} h={16} symbol="c" variant="indigo" />
    <Op id="ffn-c2" x={220} y={156} w={16} h={16} symbol="c" variant="indigo" />
    <Arrow from="ffn-c1" to="ffn-gate" variant="indigo" dashed />
    <Arrow from="ffn-c2" to="ffn-ss" variant="indigo" dashed />
  </Box>
  <Arrow id="ffn-in" from={[1056, 728]} to="ffn-rms2" />
  <Arrow from="ffn-add" to={[1056, 460]} />

  <Text x={24} y={736} w={560} h={20} variant="caption">Iris-3B · full model</Text>
  <Text x={648} y={736} w={552} h={20} variant="caption" className="justify-end">PiT block (top) · trunk block (bottom)</Text>

  <Steps>
    <Step title="Encode the prompt" focus="prompt qwen adapter">{`The prompt $y$ goes through **Qwen3-VL-4B-Instruct**, a vision-language model that stays **frozen** (❄): Iris trains none of its 4B parameters.

Instead of taking only the last layer, a small **text adapter** reads hidden states from 12 of its layers, fuses them with attention pooling over the layers and refines them with two transformer blocks. The result is a sequence of text tokens for the trunk.`}</Step>
    <Step title="Cut the noisy image into patches" focus="noisy patchify timestep embed">{`During training, a clean image $x_0$ is mixed with noise: $x_t = (1-t)\,x_0 + t\,\epsilon$. At generation time, $x_t$ starts as pure noise.

**Patchify** cuts $x_t$ into $16 \times 16$ pixel patches, one image token each: a $64 \times 64$ grid at 1024 px. Note that these are *pixels*, not the latent of a VAE as in most diffusion models.

The noise level $t$ is embedded separately. Through **shared-bias adaLN** it modulates every block (dashed lines): one shared projection per stream plus small per-block biases, 28 % fewer parameters than a projection in every block.`}</Step>
    <Step title="Dual-stream blocks" focus="dual adapter patchify">{`The first **8 blocks** are dual-stream (MMDiT): text and image tokens have **separate weights** for their projections and MLPs, but they meet in one joint attention (↔), so image tokens can read the prompt and text tokens can adapt to the image.

Image tokens get **2D RoPE**, a rotary position encoding along rows and columns. It has no learned table of positions, so the same weights work at 256, 512 and 1024 px and for aspect ratios from 1:4 to 4:1.`}</Step>
    <Step title="Single-stream blocks" focus="single">{`The next **16 blocks** concatenate text and image into one sequence (⊙) and process it with **shared weights**, like a standard transformer. This hybrid layout (FLUX.1) spends the separate weights where the two modalities still differ most, and saves parameters later.

The output for each image patch is its **semantic token**.`}</Step>
    <Step title="Inside a trunk block" focus="attention ffn">{`Each block has an attention part and a feed-forward part, both with the same pattern:

1. **RMSNorm**, then **scale & shift** from the timestep,
2. the layer itself: **grouped-query attention** (20 query heads share 5 key/value heads; QK-Norm and RoPE before, a **sigmoid output gate** after) or a **SwiGLU** feed-forward network,
3. another **RMSNorm** on the output (*sandwich normalization*), and a timestep **gate**,
4. a **residual** addition.

The extra normalization and the two gates keep the updates of 24 blocks at a controlled size, which makes training stable at this width (2560).`}</Step>
    <Step title="Decode pixels with the PiT head" focus="semantic patch1 pit pit-detail">{`Here Iris differs most from latent diffusion. Instead of a VAE decoder, a small **pixel transformer** (PiT, from PixelDiT) produces the pixels:

- **1×1 patchify** turns every pixel of $x_t$ into its own token.
- **Pixel-wise adaLN** projects each patch's semantic token into a separate scale and shift for *every one* of its 256 pixels: the trunk says what the patch should show, the head works out each pixel.
- For attention, the 256 pixel tokens of a patch are **compressed** into one token, attend across all patches (256× shorter than attending over pixels) and are **expanded** back.

4 such blocks run in sequence.`}</Step>
    <Step title="Predict the velocity" focus="outproj vtheta">{`The output projection turns the pixel tokens into the **velocity** $v_\theta(x_t, t, y)$, an estimate of $\epsilon - x_0$: the direction from the clean image to the noise.

Training minimizes the squared error to the true velocity (rectified flow) at 256, then 512, then 1024 px, followed by fine-tuning on curated images. To generate, a sampler starts from noise and takes small steps against the velocity: 100 steps with classifier-free guidance 3, or 4 steps for the distilled Iris-3B Turbo.`}</Step>
  </Steps>
</Diagram>
