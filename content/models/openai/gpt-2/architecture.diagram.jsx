// GPT-2: decoder-only transformer language model with pre-LayerNorm blocks (bottom to top).
<Diagram width={608} height={840} grid={4} title="GPT-2 architecture">
  <Text x={24} y={20} variant="caption">GPT-2 · decoder-only transformer</Text>

  {/* ---------- output ---------- */}
  <Text id="out-label" x={144} y={40} w={224} h={20} variant="label" className="justify-center">Next-token probabilities</Text>
  <Box id="softmax" x={144} y={84} w={224} h={28} variant="green" tip={`Turns the logits into a probability distribution over the 50,257 tokens. The output at position $t$ is the prediction for token $t+1$.

**Training** maximizes the probability of the actual next token at *every* position of a 1024-token window at once (cross-entropy). **Generation** samples one token from the last position, appends it to the input and runs the model again.`}>Softmax</Box>
  <Box id="lm-head" x={144} y={136} w={224} h={28} variant="violet" tip={`Maps each final vector to **logits**, one score per vocabulary token. GPT-2 has no separate weight matrix here: it multiplies with the *transposed token-embedding matrix* (weight tying). A token's input vector and its output direction are the same, and the model saves $50{,}257 \times 768 \approx 38.6$M parameters at the smallest size.`}>Linear (LM head)</Box>
  <Box id="ln-f" x={144} y={188} w={224} h={28} variant="yellow" tip={`A **final LayerNorm**, added in GPT-2. With pre-norm blocks the residual stream is never normalized inside the stack, and its scale grows with depth; this layer normalizes it once before the output layer.`}>LayerNorm</Box>

  {/* ---------- transformer block ---------- */}
  <Box id="block" x={104} y={244} w={304} h={376} variant="panel-blue" tip={`One **transformer block**. GPT-2 stacks 12 (124M), 24 (355M), 36 (774M) or 48 (1.5B) of them, each with its own weights. A block reads from the residual stream (the vertical line) and *adds* two updates to it: one from attention, one from the MLP.`}>
    Transformer block
    <Text x={180} y={8} w={112} h={20} variant="label" className="justify-end">×12 / 24 / 36 / 48</Text>
    <Op id="add2" x={144} y={52} w={16} h={16} tip={`Residual connection: the MLP's output is added to its input. The block never overwrites the stream, it only adds to it, so information and gradients can pass through dozens of blocks unchanged.`} />
    <Box id="mlp" x={40} y={96} w={224} h={32} variant="sky" tip={`**Feed-forward network**, applied to every token on its own: Linear $d \to 4d$, GELU, Linear $4d \to d$ (768 → 3072 → 768 in the small model). It holds about two thirds of a block's parameters.

Attention moves information *between* tokens; the MLP then processes it *within* each token. Many facts the model has memorized are thought to live in these weights.`}>MLP · GELU</Box>
    <Box id="ln2" x={40} y={152} w={224} h={28} variant="yellow" tip={`**Pre-norm**: the LayerNorm sits at the *input* of the sub-block (GPT-1 and the original Transformer normalized *after* the residual addition). It rescales each token vector to zero mean and unit variance, then applies a learned scale and shift. The residual path itself stays un-normalized, which makes deep stacks much easier to train.`}>LayerNorm</Box>
    <Op id="add1" x={144} y={216} w={16} h={16} tip={`Residual connection around attention. At initialization GPT-2 scales the weights of the layers that write into the residual stream by $1/\sqrt{N}$ ($N$ = number of residual layers), so the sum of many small updates does not blow up in deep models.`} />
    <Box id="attn" x={40} y={264} w={224} h={32} variant="orange" link="#attention.diagram.jsx" tip={`**Masked multi-head self-attention**: every token compares its *query* with the *keys* of itself and all **earlier** tokens and takes a weighted average of their *values*. The causal mask hides later tokens, so the model can learn to predict every position of a sequence in one pass without seeing the answer.

12 to 25 heads of size 64 run in parallel, each free to track a different relation (previous word, matching bracket, subject of the sentence …). Click for the details.`}>Masked multi-head attention</Box>
    <Box id="ln1" x={40} y={320} w={224} h={28} variant="yellow" tip={`Pre-norm LayerNorm at the input of the attention sub-block (see the one above the MLP).`}>LayerNorm</Box>
    <Arrow from="ln1" to="attn" />
    <Arrow from="attn" to="add1" />
    <Arrow id="mid" from="add1" to="ln2" />
    <Arrow from="ln2" to="mlp" />
    <Arrow from="mlp" to="add2" />
    <Arrow from="stream-in@0.786" to="add1@left" via={[[20, 360], [20, 224]]} variant="muted" />
    <Arrow from="mid@0.444" to="add2@left" via={[[20, 200], [20, 60]]} variant="muted" />
  </Box>

  {/* ---------- embeddings ---------- */}
  <Op id="add0" x={248} y={648} w={16} h={16} tip={`Token and position embeddings are **added**, not concatenated: both kinds of information share one vector, in different directions. This sum is the start of the **residual stream** that every block reads from and writes to.`} />
  <Box id="pos-emb" x={424} y={640} w={152} h={32} variant="pink" tip={`Attention by itself ignores order: *dog bites man* and *man bites dog* would look the same. GPT-2 therefore **learns** one vector for each position $0 \ldots 1023$ (its context length) and adds it to the token embedding. Unlike the fixed sinusoids of the original Transformer, these vectors are trained like any other weight.`}>Position embedding</Box>
  <Text id="positions" x={424} y={700} w={152} h={24} variant="label" className="justify-center">positions <Math tex="0, 1, \ldots, T{-}1" /></Text>
  <Box id="tok-emb" x={144} y={696} w={224} h={32} variant="pink" tip={`A lookup table with one learned vector of size $d_\text{model}$ (768, 1024, 1280 or 1600) for each of the 50,257 tokens: token id $i$ selects row $i$. The same matrix, transposed, is the output layer at the top.`}>Token embedding</Box>
  <Group id="tokens" x={144} y={768} w={224} h={24} tip={`GPT-2 reads text as **tokens** from a *byte-level* BPE vocabulary of 50,257 entries. BPE starts from the 256 possible byte values and keeps merging the most frequent adjacent pair into a new token. Frequent words become single tokens (with their leading space, as in " cat"), rare words are split into pieces, and any Unicode string can be encoded without an "unknown" token.`}>
    <Box x={0} y={0} w={44} h={24} variant="amber" className="text-[12px]">The</Box>
    <Box x={52} y={0} w={44} h={24} variant="amber" className="text-[12px]">␣cat</Box>
    <Box x={104} y={0} w={44} h={24} variant="amber" className="text-[12px]">␣sat</Box>
    <Text x={152} y={0} w={20} h={24} variant="label" className="justify-center">…</Text>
    <Box x={180} y={0} w={44} h={24} variant="amber" className="text-[12px]">␣on</Box>
  </Group>
  <Text x={144} y={800} w={224} h={20} variant="label" className="justify-center">input tokens</Text>

  <Arrow from="tokens" to="tok-emb" />
  <Arrow from="tok-emb" to="add0" />
  <Arrow from="positions" to="pos-emb" />
  <Arrow from="pos-emb" to="add0@right" />
  <Arrow id="stream-in" from="add0" to="ln1" />
  <Arrow from="add2" to="ln-f" />
  <Arrow from="ln-f" to="lm-head" />
  <Arrow from="lm-head" to="softmax" />
  <Arrow from="softmax" to="out-label" />
  <Arrow from="lm-head@left" to="tok-emb@left" via={[[48, 150], [48, 712]]} head="none" variant="muted" dashed labelAt={0.5} tip="Weight tying: the LM head is the token-embedding matrix, transposed.">tied weights</Arrow>

  <Steps>
    <Step title="Split the text into tokens" focus="tokens">{`The input is a sequence of up to 1024 **tokens** from a byte-level BPE vocabulary of 50,257 entries.

Working on raw *bytes* (instead of Unicode characters) means the base vocabulary has only 256 symbols, yet any text, in any language or with emojis, can be encoded. BPE then merges frequent byte pairs into larger units, so common words cost one token and rare words a few. GPT-2 also stops BPE from merging across character categories, so that "dog", "dog." and "dog!" do not each need their own token.`}</Step>
    <Step title="Embed tokens and positions" focus="tokens tok-emb positions pos-emb add0">{`Each token id selects a learned vector from the **token embedding** (768 numbers in the small model).

Self-attention by itself treats its input as a *set*, so order has to be added explicitly: a learned **position embedding** for each slot $0 \ldots 1023$ is added to the token vector. The sum is the **residual stream**: a vector per token that every block reads and adds to.`}</Step>
    <Step title="Masked self-attention" focus="ln1 attn add1">{`The first sub-block lets tokens **exchange information**. LayerNorm first normalizes each vector; then every token forms a *query*, compares it with the *keys* of all tokens up to and including itself, and takes a weighted average of their *values*.

The **causal mask** makes the model *autoregressive*: position $t$ never sees tokens after $t$. Because of that, one forward pass trains the model on all 1024 next-token predictions of a sequence at once.

The result is **added** to the stream (residual connection) rather than replacing it.`}</Step>
    <Step title="Feed-forward MLP" focus="ln2 mlp add2">{`The second sub-block works on each token **separately**: it expands the vector to 4× its width, applies GELU and projects back ($768 \to 3072 \to 768$).

Attention gathers information from other tokens; the MLP transforms what was gathered. Again the output is added to the residual stream.`}</Step>
    <Step title="Stack the blocks" focus="block">{`The block is repeated **12 to 48 times** with separate weights:

| Model | Blocks | $d_\text{model}$ | Heads |
|---|---|---|---|
| 124M | 12 | 768 | 12 |
| 355M | 24 | 1024 | 16 |
| 774M | 36 | 1280 | 20 |
| 1.5B | 48 | 1600 | 25 |

Two changes from GPT-1 make this depth trainable: LayerNorm moved to the **input** of each sub-block (pre-norm), so the residual path is a clean sum, and the residual layers' initial weights are scaled by $1/\sqrt{N}$.`}</Step>
    <Step title="Predict the next token" focus="ln-f lm-head softmax out-label">{`After the last block a **final LayerNorm** normalizes the stream. The LM head multiplies each vector with the transposed token embedding (**tied weights**), giving one score per vocabulary token, and a softmax turns the scores into probabilities.

To generate text, GPT-2 samples a token from the distribution at the last position, appends it to the input and repeats. Trained only on this next-token objective over 8 million web pages (WebText), the 1.5B model could already translate, summarize and answer questions *zero-shot*, without task-specific training.`}</Step>
  </Steps>
</Diagram>
