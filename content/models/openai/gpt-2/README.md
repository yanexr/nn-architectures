## How it works

GPT-2 is an autoregressive language model: given tokens $x_1, \dots, x_{t}$ it predicts a distribution over the next token,

$$
p(x) = \prod_{t=1}^{T} p(x_t \mid x_{<t}).
$$

It is a stack of transformer **decoder** blocks without cross-attention. Compared with GPT-1, LayerNorm moved to the *input* of each sub-block (pre-norm), a final LayerNorm was added after the last block, and residual weights are scaled by $1/\sqrt{N}$ at initialization.

Each block applies masked self-attention and a position-wise MLP, each wrapped in a residual connection:

$$
\begin{aligned}
h &= x + \mathrm{Attn}(\mathrm{LN}(x)) \\
y &= h + \mathrm{MLP}(\mathrm{LN}(h))
\end{aligned}
$$

| Model | Layers | $d_\text{model}$ | Heads | Parameters |
|---|---|---|---|---|
| GPT-2 small | 12 | 768 | 12 | 124M |
| GPT-2 medium | 24 | 1024 | 16 | 355M |
| GPT-2 large | 36 | 1280 | 20 | 774M |
| GPT-2 XL | 48 | 1600 | 25 | 1.5B |

All sizes use a byte-level BPE vocabulary of 50,257 tokens and a context of 1024 tokens. The output layer shares its weights with the token embedding. (The paper lists 117M, 345M, 762M and 1542M parameters; the numbers above are those of the released checkpoints.)
