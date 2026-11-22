// GPT-2 masked multi-head self-attention (one block), bottom to top.
<Diagram width={608} height={592} grid={4} title="GPT-2 masked self-attention">
  <Text x={24} y={20} variant="caption">Masked multi-head self-attention</Text>

  <Box id="wo" x={208} y={40} w={224} h={28} variant="violet" tip={`**Output projection** $W_O$ ($d \times d$, called \`c_proj\` in the code). The heads were computed independently; this layer mixes their results and maps them back into the residual stream, where the output is added to the block's input.`}>Linear <Math tex="W_O" /></Box>
  <Box id="concat" x={176} y={92} w={288} h={28} variant="muted" tip={`The $h$ head outputs (64 numbers each) are placed side by side, giving back one vector of size $d = 64h$ per token.`}>Concat heads</Box>

  {/* ---------- one head ---------- */}
  <Box id="head" x={152} y={148} w={336} h={312} variant="panel-orange" tip={`Everything in this panel runs once per head, in parallel: 12, 16, 20 or 25 heads of size $d_k = 64$. Each head has its own slices of $W_Q, W_K, W_V$, so each can learn its own notion of which tokens are relevant.`}>
    One attention head
    <Text x={248} y={8} w={72} h={20} variant="label" className="justify-end">×h</Text>
    <Box id="av" x={24} y={40} w={296} h={32} variant="orange" tip={`Each token's output is the **attention-weighted average of the value vectors**: $\mathrm{out}_t = \sum_{s \le t} A_{ts}\, v_s$. Keys decide *where* to look, values decide *what* is read from there.`}>
      <Math tex="A\,V" />
    </Box>
    <Box id="softmax" x={24} y={108} w={144} h={28} variant="green" tip={`Row-wise softmax: each token's scores become **attention weights** $A_{ts} \ge 0$ that sum to 1. Masked entries ($-\infty$) get weight exactly 0.`}>Softmax</Box>
    <Table id="attn-map" x={196} y={100} w={72} h={72} lines="none" tip={`Example attention weights $A$ for a 6-token sequence (rows: the token that is reading, columns: the tokens it reads from). Everything above the diagonal is 0 because of the causal mask; many heads put a lot of weight on the token itself, the previous token or the first token.`}>
      <Row><Cell className="bg-orange-500/70" /><Cell /><Cell /><Cell /><Cell /><Cell /></Row>
      <Row><Cell className="bg-orange-500/40" /><Cell className="bg-orange-500/60" /><Cell /><Cell /><Cell /><Cell /></Row>
      <Row><Cell className="bg-orange-500/30" /><Cell className="bg-orange-500/50" /><Cell className="bg-orange-500/40" /><Cell /><Cell /><Cell /></Row>
      <Row><Cell className="bg-orange-500/40" /><Cell className="bg-orange-500/10" /><Cell className="bg-orange-500/30" /><Cell className="bg-orange-500/50" /><Cell /><Cell /></Row>
      <Row><Cell className="bg-orange-500/30" /><Cell className="bg-orange-500/20" /><Cell className="bg-orange-500/10" /><Cell className="bg-orange-500/40" /><Cell className="bg-orange-500/50" /><Cell /></Row>
      <Row><Cell className="bg-orange-500/40" /><Cell className="bg-orange-500/10" /><Cell className="bg-orange-500/20" /><Cell className="bg-orange-500/10" /><Cell className="bg-orange-500/30" /><Cell className="bg-orange-500/60" /></Row>
    </Table>
    <Text x={180} y={176} w={104} h={20} variant="label" className="justify-center">weights <Math tex="A" /> (example)</Text>
    <Op id="add" x={88} y={156} w={16} h={16} tip={`The causal mask is **added** to the scores before the softmax.`} />
    <Box id="qk" x={24} y={192} w={144} h={44} variant="orange" tip={`**Scores**: the dot product of every query with every key, $s_{ts} = q_t \cdot k_s / \sqrt{d_k}$. A high score means token $s$ has what token $t$ is looking for. Dividing by $\sqrt{d_k} = 8$ keeps the scores in a range where the softmax is not saturated, so gradients do not vanish.`}>
      <Math tex="\frac{Q K^\top}{\sqrt{d_k}}" />
    </Box>
    <Box id="q" x={36} y={264} w={40} h={28} tip={`**Queries**: what each token is looking for (64 numbers per head).`}><Math tex="Q" /></Box>
    <Box id="k" x={116} y={264} w={40} h={28} tip={`**Keys**: what each token offers to be found by (64 numbers per head).`}><Math tex="K" /></Box>
    <Box id="v" x={276} y={264} w={40} h={28} tip={`**Values**: the content a token passes on when it is attended to (64 numbers per head).`}><Math tex="V" /></Box>
    <Arrow from="q" to="qk@bottom:32px" />
    <Arrow from="k" to="qk@bottom:112px" />
    <Arrow from="qk" to="add" />
    <Arrow from="add" to="softmax" />
    <Arrow from="softmax" to="av@bottom:72px" />
    <Arrow from="v" to="av@bottom:272px" />
  </Box>

  {/* ---------- causal mask ---------- */}
  <Text x={8} y={256} w={128} h={20} variant="label" className="justify-center">causal mask <Math tex="M" /></Text>
  <Box id="mask" x={8} y={280} w={128} h={64} variant="ghost" tip={`The **causal mask** $M$: 0 where token $t$ may look (itself and earlier tokens), $-\infty$ above the diagonal. After the softmax, $e^{-\infty} = 0$, so no token can see the future. This is what makes GPT-2 a left-to-right language model, and it lets training predict every position of a sequence in a single pass. (The code subtracts $10^{10}$ instead of using a true $-\infty$.)`}>
    <Math tex="\begin{bmatrix} 0 & -\infty & -\infty \\ 0 & 0 & -\infty \\ 0 & 0 & 0 \end{bmatrix}" />
  </Box>

  <Box id="qkv" x={152} y={492} w={336} h={28} variant="violet" tip={`One fused linear layer (\`c_attn\`, $d \times 3d$) computes queries, keys and values for all heads at once; the result is split into $Q$, $K$, $V$ and then into $h$ heads of 64 dimensions each.`}>Linear <Math tex="W_Q,\ W_K,\ W_V" /></Box>
  <Text id="x-in" x={256} y={544} w={128} h={24} className="justify-center" tip="The LayerNorm-ed residual stream: one vector of size $d$ per token.">
    <Math tex="X \in \mathbb{R}^{T \times d}" />
  </Text>

  <Arrow from="x-in" to="qkv" />
  <Arrow from="qkv@top:56px" to="q" />
  <Arrow from="qkv@top:136px" to="k" />
  <Arrow from="qkv@top:296px" to="v" />
  <Arrow from="mask" to="add@left" />
  <Arrow from="av" to="concat" />
  <Arrow from="concat" to="wo" />
  <Arrow from="wo" to={[320, 8]} />

  <Steps>
    <Step title="Queries, keys and values" focus="x-in qkv q k v">{`Each token's (normalized) vector is projected three times:

- a **query** $q$: what this token is looking for,
- a **key** $k$: what it offers to others,
- a **value** $v$: the information it hands over when attended to.

GPT-2 computes all three with one fused linear layer and splits the result into $h$ heads of 64 dimensions, so every head works with its own small $q$, $k$, $v$.`}</Step>
    <Step title="Score every pair of tokens" focus="q k qk">{`The dot product $q_t \cdot k_s$ measures how well token $s$ matches what token $t$ is looking for. Computing it for all pairs gives a $T \times T$ score matrix $QK^\top$.

The scores are divided by $\sqrt{d_k} = 8$: dot products of 64-dimensional vectors grow with the dimension, and large scores would push the softmax into a regime with almost no gradient.`}</Step>
    <Step title="Hide the future" focus="mask add">{`A language model must not see the token it is trying to predict. The **causal mask** adds $-\infty$ to every score where $s > t$ (a token looking at a later one).

Because of the mask, one forward pass over a 1024-token sequence gives 1024 valid training examples at once: each position predicts its successor from only its past. At generation time this also lets the model cache keys and values of earlier tokens.`}</Step>
    <Step title="Weights, then a weighted average" focus="softmax attn-map av v">{`A softmax over each row turns the scores into weights that are positive and sum to 1 (masked entries become exactly 0). The example map shows such a lower-triangular pattern.

Each token's output is the weighted average of the value vectors, $\sum_s A_{ts} v_s$: information flows from the attended tokens into the reading token.`}</Step>
    <Step title="Combine the heads" focus="head concat wo">{`All heads run in parallel, each with its own projections, so different heads can specialize: one follows the previous token, another links a pronoun to its noun, another tracks brackets.

Their outputs are concatenated back to size $d$ and mixed by the output projection $W_O$. The result is added to the residual stream of the block.`}</Step>
  </Steps>
</Diagram>
