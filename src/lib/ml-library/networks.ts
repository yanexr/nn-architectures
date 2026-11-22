/**
 * Networks drawn from neurons and connections. Every neuron is a circle and
 * every connection a line, inside a group: click selects the network,
 * double-click enters it to move, recolor or delete single neurons.
 */
import { libraryItem as item, type LibrarySection } from "@nn-diagram/editor";
import { network } from "./build";

/** A 5×5 input, a 3×3 kernel window on it, and the 3×3 output with the cell the window produces. */
function convolution(): string {
  const row = (n: number, hi: (c: number) => boolean) => `<Row>${Array.from({ length: n }, (_, c) => (hi(c) ? '<Cell variant="teal" />' : "<Cell />")).join("")}</Row>`;
  const input = Array.from({ length: 5 }, (_, r) => `    ${row(5, (c) => r >= 1 && r <= 3 && c >= 1 && c <= 3)}`).join("\n");
  const output = Array.from({ length: 3 }, (_, r) => `    ${row(3, (c) => r === 1 && c === 1)}`).join("\n");
  return `<Group x={0} y={0} w={248} h={124}>
  <Table id="conv-in" x={0} y={0} w={100} h={100}>
${input}
  </Table>
  <Table id="conv-out" x={172} y={20} w={60} h={60}>
${output}
  </Table>
  <Arrow from={[80, 20]} to={[192, 40]} route="straight" head="none" variant="teal" dashed />
  <Arrow from={[80, 80]} to={[192, 60]} route="straight" head="none" variant="teal" dashed />
  <Text x={0} y={104} w={100} h={20} variant="label" className="justify-center">input</Text>
  <Text x={156} y={84} w={92} h={20} variant="label" className="justify-center">feature map</Text>
</Group>`;
}

/**
 * LSTM cell in the usual layout: the cell state runs along the top, the
 * gate layers (σ, σ, tanh, σ) sit on a bus fed by h_{t-1} and x_t, and the
 * pointwise operations are circles.
 */
const lstm = String.raw`<Box id="lstm" x={0} y={0} w={320} h={256} variant="panel-purple">
  LSTM cell
  <Op id="lstm-forget" x={52} y={48} w={16} h={16} symbol="x" tip="Forget: scales the old cell state elementwise by $f_t \in (0,1)$." />
  <Op id="lstm-add" x={136} y={48} w={16} h={16} symbol="+" tip="Adds the new candidate values: $c_t = f_t \odot c_{t-1} + i_t \odot g_t$." />
  <Op id="lstm-in" x={136} y={104} w={16} h={16} symbol="x" tip="Input: how much of the candidate $g_t$ to write, $i_t \odot g_t$." />
  <Box id="lstm-tanh-c" x={252} y={100} w={48} h={24} variant="green" className="rounded-full">tanh</Box>
  <Op id="lstm-out" x={268} y={164} w={16} h={16} symbol="x" tip="Output: $h_t = o_t \odot \tanh(c_t)$." />
  <Box id="lstm-f" x={36} y={160} w={48} h={24} variant="green" tip="Forget gate $f_t = \sigma(W_f[h_{t-1}, x_t] + b_f)$.">σ</Box>
  <Box id="lstm-i" x={92} y={160} w={48} h={24} variant="green" tip="Input gate $i_t = \sigma(W_i[h_{t-1}, x_t] + b_i)$.">σ</Box>
  <Box id="lstm-g" x={148} y={160} w={48} h={24} variant="green" tip="Candidate values $g_t = \tanh(W_g[h_{t-1}, x_t] + b_g)$.">tanh</Box>
  <Box id="lstm-o" x={204} y={160} w={48} h={24} variant="green" tip="Output gate $o_t = \sigma(W_o[h_{t-1}, x_t] + b_o)$.">σ</Box>
  <Arrow from={[0, 56]} to="lstm-forget" />
  <Arrow from="lstm-forget" to="lstm-add" />
  <Arrow id="lstm-c" from="lstm-add" to={[320, 56]} />
  <Arrow from="lstm-c@0.738" to="lstm-tanh-c" />
  <Arrow from="lstm-tanh-c" to="lstm-out" />
  <Arrow from="lstm-f" to="lstm-forget" />
  <Arrow from="lstm-i" to="lstm-in@left" via={[[116, 112]]} />
  <Arrow from="lstm-g" to="lstm-in@right" via={[[172, 112]]} />
  <Arrow from="lstm-in" to="lstm-add" />
  <Arrow from="lstm-o" to="lstm-out" />
  <Arrow from="lstm-out" to={[320, 172]} />
  <Arrow id="lstm-bus" from={[0, 216]} to={[228, 216]} head="none" />
  <Arrow from={[20, 256]} to="lstm-bus@0.088" />
  <Arrow from="lstm-bus@0.263" to="lstm-f" />
  <Arrow from="lstm-bus@0.509" to="lstm-i" />
  <Arrow from="lstm-bus@0.754" to="lstm-g" />
  <Arrow from="lstm-bus@1" to="lstm-o" />
  <Text x={4} y={32} w={40} h={20} variant="math"><Math tex="c_{t-1}" /></Text>
  <Text x={276} y={32} w={40} h={20} variant="math" className="justify-end"><Math tex="c_t" /></Text>
  <Text x={4} y={192} w={40} h={20} variant="math"><Math tex="h_{t-1}" /></Text>
  <Text x={28} y={232} w={32} h={20} variant="math"><Math tex="x_t" /></Text>
  <Text x={288} y={148} w={28} h={20} variant="math" className="justify-end"><Math tex="h_t" /></Text>
</Box>`;

const rnn = `<Group x={0} y={0} w={392} h={164}>
  <Box id="rnn-h1" x={40} y={60} w={72} h={40} variant="purple">RNN</Box>
  <Box id="rnn-h2" x={160} y={60} w={72} h={40} variant="purple">RNN</Box>
  <Box id="rnn-h3" x={280} y={60} w={72} h={40} variant="purple">RNN</Box>
  <Box id="rnn-x1" x={60} y={132} w={32} h={32} shape="ellipse" variant="amber">$x_1$</Box>
  <Box id="rnn-x2" x={180} y={132} w={32} h={32} shape="ellipse" variant="amber">$x_2$</Box>
  <Box id="rnn-x3" x={300} y={132} w={32} h={32} shape="ellipse" variant="amber">$x_3$</Box>
  <Box id="rnn-y1" x={60} y={0} w={32} h={32} shape="ellipse" variant="green">$y_1$</Box>
  <Box id="rnn-y2" x={180} y={0} w={32} h={32} shape="ellipse" variant="green">$y_2$</Box>
  <Box id="rnn-y3" x={300} y={0} w={32} h={32} shape="ellipse" variant="green">$y_3$</Box>
  <Arrow from={[0, 80]} to="rnn-h1">$h_0$</Arrow>
  <Arrow from="rnn-h1" to="rnn-h2">$h_1$</Arrow>
  <Arrow from="rnn-h2" to="rnn-h3">$h_2$</Arrow>
  <Arrow from="rnn-h3" to={[392, 80]}>$h_3$</Arrow>
  <Arrow from="rnn-x1" to="rnn-h1" />
  <Arrow from="rnn-x2" to="rnn-h2" />
  <Arrow from="rnn-x3" to="rnn-h3" />
  <Arrow from="rnn-h1" to="rnn-y1" />
  <Arrow from="rnn-h2" to="rnn-y2" />
  <Arrow from="rnn-h3" to="rnn-y3" />
</Group>`;

const perceptron = `<Group x={0} y={0} w={296} h={128}>
  <Box id="p-x1" x={0} y={0} w={32} h={32} shape="ellipse" variant="green">$x_1$</Box>
  <Box id="p-x2" x={0} y={48} w={32} h={32} shape="ellipse" variant="green">$x_2$</Box>
  <Box id="p-x3" x={0} y={96} w={32} h={32} shape="ellipse" variant="green">$x_3$</Box>
  <Box id="p-sum" x={120} y={44} w={40} h={40} shape="ellipse" variant="blue" className="text-[16px]">Σ</Box>
  <Box id="p-act" x={192} y={48} w={40} h={32} variant="green">$\\sigma$</Box>
  <Box id="p-y" x={264} y={48} w={32} h={32} shape="ellipse" variant="orange">$y$</Box>
  <Arrow from="p-x1" to="p-sum" route="straight" labelAt={0.45}>$w_1$</Arrow>
  <Arrow from="p-x2" to="p-sum" route="straight" labelAt={0.45}>$w_2$</Arrow>
  <Arrow from="p-x3" to="p-sum" route="straight" labelAt={0.45}>$w_3$</Arrow>
  <Arrow from={[140, 124]} to="p-sum">$b$</Arrow>
  <Arrow from="p-sum" to="p-act" />
  <Arrow from="p-act" to="p-y" />
</Group>`;

const graph = `<Group x={0} y={0} w={216} h={152}>
  <Box id="g-1" x={92} y={56} w={32} h={32} shape="ellipse" variant="orange">$h_1$</Box>
  <Box id="g-2" x={24} y={0} w={32} h={32} shape="ellipse" variant="blue">$h_2$</Box>
  <Box id="g-3" x={0} y={88} w={32} h={32} shape="ellipse" variant="blue">$h_3$</Box>
  <Box id="g-4" x={84} y={120} w={32} h={32} shape="ellipse" variant="blue">$h_4$</Box>
  <Box id="g-5" x={160} y={0} w={32} h={32} shape="ellipse" variant="blue">$h_5$</Box>
  <Box id="g-6" x={184} y={96} w={32} h={32} shape="ellipse" variant="blue">$h_6$</Box>
  <Arrow from="g-2" to="g-1" route="straight" variant="blue" />
  <Arrow from="g-3" to="g-1" route="straight" variant="blue" />
  <Arrow from="g-4" to="g-1" route="straight" variant="blue" />
  <Arrow from="g-5" to="g-1" route="straight" variant="blue" />
  <Arrow from="g-6" to="g-1" route="straight" variant="blue" />
  <Arrow from="g-2" to="g-3" route="straight" head="none" variant="muted" />
  <Arrow from="g-5" to="g-6" route="straight" head="none" variant="muted" />
  <Arrow from="g-4" to="g-6" route="straight" head="none" variant="muted" />
</Group>`;

export const NETWORKS_SECTION: LibrarySection = {
  id: "ml-networks",
  title: "Neural networks",
  size: "large",
  items: [
    item("perceptron", "Perceptron", perceptron, "neuron weights bias activation single"),
    item("mlp", "MLP", network([3, 4, 2], { id: "mlp", labels: ["Input", "Hidden", "Output"] }), "dense fully connected feed forward perceptron"),
    item("deep-mlp", "Deep MLP", network([3, 5, 5, 2], { id: "dnn", gapY: 28, labels: ["Input", "Hidden 1", "Hidden 2", "Output"] }), "deep dense fully connected"),
    item(
      "autoencoder",
      "Autoencoder",
      network([5, 3, 2, 3, 5], { id: "ae", gapX: 56, gapY: 28, variants: ["green", "blue", "emerald", "blue", "orange"], labels: ["$x$", "", "$z$", "", '<Math tex="\\hat{x}" />'] }),
      "bottleneck encoder decoder latent",
    ),
    item("rnn", "RNN (unrolled)", rnn, "recurrent sequence hidden state time steps"),
    item("lstm", "LSTM cell", lstm, "gates forget input output cell state recurrent"),
    item("graph", "Graph (message passing)", graph, "gnn gat graph neural network nodes edges neighbors aggregation"),
    item("convolution", "Convolution", convolution(), "conv kernel window stride feature map 2d"),
    item(
      "cnn",
      "CNN feature maps",
      `<Group x={0} y={0} w={368} h={156}>
  <Cuboid id="cnn-1" x={0} y={0} w={40} h={128} depth={28} variant="teal" />
  <Cuboid id="cnn-2" x={72} y={16} w={48} h={104} depth={32} variant="teal" />
  <Cuboid id="cnn-3" x={152} y={32} w={56} h={80} depth={36} variant="teal" />
  <Cuboid id="cnn-4" x={240} y={48} w={64} h={56} depth={40} variant="teal" />
  <Box id="cnn-fc" x={336} y={52} w={24} h={52} variant="violet" />
  <Arrow from="cnn-1" to="cnn-2" />
  <Arrow from="cnn-2" to="cnn-3" />
  <Arrow from="cnn-3" to="cnn-4" />
  <Arrow from="cnn-4" to="cnn-fc" />
  <Text x={0} y={136} w={40} h={20} variant="label" className="justify-center">conv1</Text>
  <Text x={72} y={136} w={48} h={20} variant="label" className="justify-center">conv2</Text>
  <Text x={152} y={136} w={56} h={20} variant="label" className="justify-center">conv3</Text>
  <Text x={240} y={136} w={64} h={20} variant="label" className="justify-center">conv4</Text>
  <Text x={328} y={136} w={40} h={20} variant="label" className="justify-center">fc</Text>
</Group>`,
      "convolution encoder downsampling layers",
    ),
  ],
};
