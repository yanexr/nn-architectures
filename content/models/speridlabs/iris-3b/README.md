## How it works

Iris-3B is a text-to-image model that works **directly in pixel space**. Most diffusion models generate a compressed latent and decode it with a VAE. Iris skips the VAE: a small pixel transformer (the *PiT head*) decodes every patch token back to RGB pixels.

**Trunk.** The image is cut into $16 \times 16$ pixel patches. The trunk is a 2560-wide diffusion transformer with 8 *dual-stream* blocks (separate weights for text and image tokens) followed by 16 *single-stream* blocks over the concatenated sequence. Attention is grouped-query (20 query heads, 5 key/value heads) with a sigmoid output gate, and each sub-block has RMSNorm on both its input and output (sandwich normalization). The timestep modulates all blocks through *shared-bias adaLN*: one shared projection per stream plus small per-block biases. 2D RoPE lets one set of weights run at any resolution and aspect ratio up to one megapixel.

**Text.** Prompts are encoded by a frozen Qwen3-VL-4B-Instruct model. A small adapter fuses the hidden states of 12 of its layers (attention pooling over the layers) and refines them with two transformer blocks.

**PiT head.** For every patch the trunk produces a *semantic token*. Four PiT blocks (from PixelDiT) decode it into the patch's 256 pixels: the token modulates every pixel through pixel-wise adaLN, and for attention the pixels of each patch are compressed into one 1280-wide token, attend across all patches and are expanded back. The head outputs the flow-matching velocity

$$
v_\theta(x_t, t, y) \approx \frac{d x_t}{d t},
$$

trained with rectified flow at 256, 512 and 1024 px, followed by supervised fine-tuning at 1024 px.

| | |
|---|---|
| Parameters | 3B (+ 4B frozen text encoder) |
| Patch size | 16 × 16 |
| Trunk | 8 dual-stream + 16 single-stream blocks |
| Pixel head | 4 PiT blocks |
| GenEval / DPG (1024²) | 0.798 / 86.52 |
