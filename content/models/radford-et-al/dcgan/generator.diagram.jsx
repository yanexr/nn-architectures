// DCGAN generator, redrawn after Figure 1 of Radford, Metz & Chintala (2015). Feature maps are boxes
// (width = channels, height and depth = space); gray: the 5x5 window one position writes to in the next layer.
<Diagram width={1120} height={500} grid={4} title="DCGAN generator">
  <Text x={24} y={20} variant="caption">DCGAN · generator for 64 × 64 images</Text>

  {/* ---------- key: how to read the boxes ---------- */}
  <Group id="key" x={24} y={52} w={384} h={68}>
    <Cuboid x={0} y={0} w={32} h={20} depth={8} side="left" variant="cyan" />
    <Text x={40} y={0} w={344} h={20} variant="label">feature map: width = channels, height and depth = pixels</Text>
    <Cuboid x={0} y={24} w={32} h={20} depth={8} side="left" variant="cyan" className="border-dashed" />
    <Text x={40} y={24} w={344} h={20} variant="label">one position of a layer, all its channels</Text>
    <Cuboid x={0} y={48} w={32} h={20} depth={8} side="left" variant="gray" className="bg-gray-400 border-gray-500 dark:bg-gray-500 dark:border-gray-300" />
    <Text x={40} y={48} w={344} h={20} variant="label">the 5 × 5 region it writes to in the next layer</Text>
  </Group>

  {/* ---------- input ---------- */}
  <Text x={4} y={236} w={48} h={24} className="justify-end">100 <Math tex="z" /></Text>
  <Brace x={56} y={200} w={8} h={96} side="left" />
  <Box id="z" x={68} y={200} w={12} h={96} variant="cyan" className="rounded-none" tip={`The generator's only input: **100 random numbers** drawn from a uniform distribution. Every point in this 100-dimensional space is one image the generator can draw, and the space turns out to be well organized: walking along a straight line in $z$ changes the scene smoothly (a room slowly gains a window), and averaged $z$ vectors support arithmetic, e.g. *smiling woman − neutral woman + neutral man* gives a smiling man.`} />
  <Box id="project" x={92} y={240} w={32} h={16} shape="arrow" inset={0.4} variant="gray" tip={`Fully connected projection of $z$ (a single matrix multiplication), the first step of the generator.`} />

  {/* ---------- feature maps ---------- */}
  <Cuboid id="proj" x={136} y={216} w={176} h={64} depth={32} side="left" variant="cyan" tip={`**Project and reshape.** One matrix multiplication maps the 100 numbers of $z$ to $4 \cdot 4 \cdot 1024 = 16{,}384$ numbers, which are *reshaped* into a tiny $4 \times 4$ "image" with 1024 channels. It is the only dense layer of the generator: it turns a flat vector into a spatial tensor that convolutions can grow. Batch norm and ReLU follow.`} />
  <Cuboid id="conv1" x={360} y={176} w={176} h={140} depth={48} side="left" variant="cyan" tip={`**Fractionally-strided convolution** (today usually called a *transposed convolution*; the paper notes it is often wrongly called a deconvolution) with $5 \times 5$ kernels and stride 2. It doubles width and height (4 → 8) while the channels halve (1024 → 512): the network trades *depth of features* for *spatial detail* at every step. Followed by batch norm and ReLU.`} />
  <Cuboid id="conv2" x={584} y={152} w={160} h={192} depth={64} side="left" variant="cyan" tip={`**Fractionally-strided convolution** (today usually called a *transposed convolution*; the paper notes it is often wrongly called a deconvolution) with $5 \times 5$ kernels and stride 2. It doubles width and height (8 → 16) while the channels halve (512 → 256): the network trades *depth of features* for *spatial detail* at every step. Followed by batch norm and ReLU.`} />
  <Cuboid id="conv3" x={792} y={120} w={144} h={252} depth={80} side="left" variant="cyan" tip={`**Fractionally-strided convolution** (today usually called a *transposed convolution*; the paper notes it is often wrongly called a deconvolution) with $5 \times 5$ kernels and stride 2. It doubles width and height (16 → 32) while the channels halve (256 → 128): the network trades *depth of features* for *spatial detail* at every step. Followed by batch norm and ReLU.`} />
  <Cuboid id="conv4" x={984} y={76} w={104} h={344} depth={96} side="left" variant="cyan" tip={`**Output layer**: a last transposed convolution to **3 channels** (RGB) at $64 \times 64$. It uses **tanh** instead of ReLU, so pixels land in $[-1, 1]$, the range the training images are scaled to; the paper found that a bounded output helps the model cover the color space quickly. Batch norm is left out here: normalizing every layer, including the output, made samples oscillate and training unstable.`} />

  {/* one position of a layer (dashed) and the 5x5 window it writes to in the next layer (gray) */}
  <Cuboid id="proj-col" x={152} y={244} w={160} h={20} depth={16} side="left" variant="cyan" className="border-dashed" tip={`One spatial position of this layer with **all its channels**. A transposed convolution multiplies this single vector with the kernel and *stamps* the result as a weighted $5 \times 5$ patch into the next layer (the gray block the dashed lines lead to).`} />
  <Cuboid id="conv1-col" x={392} y={212} w={144} h={20} depth={16} side="left" variant="cyan" className="border-dashed" tip={`One spatial position of this layer with **all its channels**. A transposed convolution multiplies this single vector with the kernel and *stamps* the result as a weighted $5 \times 5$ patch into the next layer (the gray block the dashed lines lead to).`} />
  <Cuboid id="conv2-col" x={632} y={288} w={112} h={20} depth={16} side="left" variant="cyan" className="border-dashed" tip={`One spatial position of this layer with **all its channels**. A transposed convolution multiplies this single vector with the kernel and *stamps* the result as a weighted $5 \times 5$ patch into the next layer (the gray block the dashed lines lead to).`} />
  <Cuboid id="conv3-col" x={856} y={196} w={80} h={20} depth={16} side="left" variant="cyan" className="border-dashed" tip={`One spatial position of this layer with **all its channels**. A transposed convolution multiplies this single vector with the kernel and *stamps* the result as a weighted $5 \times 5$ patch into the next layer (the gray block the dashed lines lead to).`} />
  <Arrow from={[296, 244]} to={[376, 232]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[312, 256]} to={[408, 256]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[312, 264]} to={[408, 300]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[296, 252]} to={[376, 276]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[520, 212]} to={[616, 188]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[536, 224]} to={[648, 212]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[536, 232]} to={[648, 256]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[520, 220]} to={[616, 232]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[728, 288]} to={[856, 288]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[744, 300]} to={[872, 300]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[744, 308]} to={[872, 328]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[728, 296]} to={[856, 316]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[920, 196]} to={[1064, 224]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[936, 208]} to={[1080, 236]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[936, 216]} to={[1080, 256]} route="straight" head="none" variant="muted" dashed />
  <Arrow from={[920, 204]} to={[1064, 244]} route="straight" head="none" variant="muted" dashed />
  <Cuboid id="conv1-k" x={376} y={232} w={160} h={68} depth={32} side="left" variant="gray" className="bg-gray-400 border-gray-500 dark:bg-gray-500 dark:border-gray-300" tip={`The **$5 \times 5$ patch** that one input position writes to, across all channels of this layer. The next input position writes a patch shifted by **2 pixels** (stride 2), so neighboring patches overlap and are summed. That is how the resolution doubles without any fixed upsampling rule: the network *learns* how to upsample.`} />
  <Cuboid id="conv2-k" x={616} y={188} w={128} h={68} depth={32} side="left" variant="gray" className="bg-gray-400 border-gray-500 dark:bg-gray-500 dark:border-gray-300" tip={`The **$5 \times 5$ patch** that one input position writes to, across all channels of this layer. The next input position writes a patch shifted by **2 pixels** (stride 2), so neighboring patches overlap and are summed. That is how the resolution doubles without any fixed upsampling rule: the network *learns* how to upsample.`} />
  <Cuboid id="conv3-k" x={856} y={288} w={80} h={40} depth={16} side="left" variant="gray" className="bg-gray-400 border-gray-500 dark:bg-gray-500 dark:border-gray-300" tip={`The **$5 \times 5$ patch** that one input position writes to, across all channels of this layer. The next input position writes a patch shifted by **2 pixels** (stride 2), so neighboring patches overlap and are summed. That is how the resolution doubles without any fixed upsampling rule: the network *learns* how to upsample.`} />
  <Cuboid id="conv4-k" x={1064} y={224} w={24} h={32} depth={16} side="left" variant="gray" className="bg-gray-400 border-gray-500 dark:bg-gray-500 dark:border-gray-300" tip={`The **$5 \times 5$ patch** that one input position writes to, across all channels of this layer. The next input position writes a patch shifted by **2 pixels** (stride 2), so neighboring patches overlap and are summed. That is how the resolution doubles without any fixed upsampling rule: the network *learns* how to upsample.`} />

  {/* ---------- dimensions: channels on top, height and width on the left ---------- */}
  <Brace x={136} y={200} w={144} h={8} side="top" />
  <Text x={184} y={180} w={48} h={20} className="justify-center">1024</Text>
  <Text x={108} y={224} w={24} h={20} className="justify-end">4</Text>
  <Text x={120} y={268} w={24} h={20} className="justify-end">4</Text>
  <Brace x={360} y={160} w={128} h={8} side="top" />
  <Text x={400} y={140} w={48} h={20} className="justify-center">512</Text>
  <Text x={332} y={216} w={24} h={20} className="justify-end">8</Text>
  <Text x={352} y={296} w={24} h={20} className="justify-end">8</Text>
  <Brace x={584} y={136} w={96} h={8} side="top" />
  <Text x={608} y={116} w={48} h={20} className="justify-center">256</Text>
  <Text x={556} y={156} w={24} h={20} className="justify-end">16</Text>
  <Text x={584} y={320} w={24} h={20} className="justify-end">16</Text>
  <Brace x={792} y={104} w={64} h={8} side="top" />
  <Text x={800} y={84} w={48} h={20} className="justify-center">128</Text>
  <Text x={764} y={124} w={24} h={20} className="justify-end">32</Text>
  <Text x={800} y={344} w={24} h={20} className="justify-end">32</Text>
  <Brace x={984} y={60} w={8} h={8} side="top" />
  <Text x={964} y={40} w={48} h={20} className="justify-center">3</Text>
  <Text x={956} y={80} w={24} h={20} className="justify-end">64</Text>
  <Text x={1000} y={384} w={24} h={20} className="justify-end">64</Text>

  {/* kernel size and stride */}
  <Text x={540} y={236} w={12} h={16} variant="label">5</Text>
  <Text x={540} y={288} w={12} h={16} variant="label">5</Text>
  <Text x={748} y={192} w={12} h={16} variant="label">5</Text>
  <Text x={748} y={244} w={12} h={16} variant="label">5</Text>
  <Text x={940} y={288} w={12} h={16} variant="label">5</Text>
  <Text x={940} y={316} w={12} h={16} variant="label">5</Text>
  <Text x={1092} y={224} w={12} h={16} variant="label">5</Text>
  <Text x={1092} y={244} w={12} h={16} variant="label">5</Text>
  <Text x={408} y={304} w={60} h={16} variant="label">stride 2</Text>
  <Text x={648} y={260} w={60} h={16} variant="label">stride 2</Text>
  <Text x={872} y={332} w={60} h={16} variant="label">stride 2</Text>
  <Text x={1028} y={260} w={60} h={16} variant="label" className="justify-end">stride 2</Text>

  {/* ---------- layer names ---------- */}
  <Text x={120} y={308} w={208} h={24} className="justify-center text-[15px]">Project and reshape</Text>
  <Text x={120} y={332} w={208} h={16} variant="label" className="justify-center">batch norm · ReLU</Text>
  <Text x={392} y={328} w={112} h={20} className="justify-center">CONV 1</Text>
  <Text x={392} y={348} w={112} h={16} variant="label" className="justify-center">batch norm · ReLU</Text>
  <Text x={608} y={356} w={112} h={20} className="justify-center">CONV 2</Text>
  <Text x={608} y={376} w={112} h={16} variant="label" className="justify-center">batch norm · ReLU</Text>
  <Text x={808} y={384} w={112} h={20} className="justify-center">CONV 3</Text>
  <Text x={808} y={404} w={112} h={16} variant="label" className="justify-center">batch norm · ReLU</Text>
  <Text x={980} y={432} w={112} h={20} className="justify-center">CONV 4</Text>
  <Text x={980} y={452} w={112} h={16} variant="label" className="justify-center">tanh</Text>

  {/* ---------- the output as an image ---------- */}

  <Steps>
    <Step title="Start from random noise" focus="z">{`The generator does not get an image or a label as input, only a vector $z$ of **100 random numbers** drawn from a uniform distribution.

Training teaches the generator to turn *any* such vector into a believable image. So $z$ becomes a "control space" for the images: the paper shows that walking along a line in $z$ changes a bedroom smoothly (no sudden jumps, which would hint at memorized training images), and that adding and subtracting averaged $z$ vectors adds and removes concepts such as glasses or a smile.`}</Step>
    <Step title="Project and reshape" focus="project proj">{`A single **fully connected layer** multiplies $z$ with a $100 \times 16{,}384$ weight matrix. The result is reshaped into a $4 \times 4$ grid with **1024 channels**: a tiny but very "deep" image.

This is the only dense layer in the network. DCGAN's guidelines remove fully connected *hidden* layers; everything after this point is convolutional, so every layer keeps a spatial layout. Like all hidden layers, it is followed by batch norm and ReLU.`}</Step>
    <Step title="Upsample with strided convolutions" focus="proj-col conv1 conv1-k">{`Each **fractionally-strided convolution** (transposed convolution) works backwards from an ordinary strided convolution. Take one position of the input, with all its channels (dashed). It is multiplied with the learned kernel and written into a **$5 \times 5$ patch** of the output (gray). The patch of the next input position is shifted by **2 pixels**, so the patches overlap and add up.

With stride 2 the output is twice as wide and tall: $4 \times 4 \to 8 \times 8$. At the same time the channels halve, $1024 \to 512$.

DCGAN replaces all fixed resampling (pooling, nearest-neighbor upsampling) with such strided convolutions, so the network **learns** its own way of upsampling.`}</Step>
    <Step title="Repeat: more pixels, fewer channels" focus="conv1-col conv2 conv2-k conv2-col conv3 conv3-k">{`The same layer type is repeated: $8 \times 8 \times 512 \to 16 \times 16 \times 256 \to 32 \times 32 \times 128$.

Early layers have few positions and many channels: they decide *what* is in the scene (room layout, where the bed goes). Later layers have many positions and few channels: they add *local detail* (edges, textures).

Every hidden layer uses **batch norm** followed by **ReLU**. The paper found batch norm essential for getting the generator to learn at all: without it, deep generators tend to collapse and map every $z$ to the same image.`}</Step>
    <Step title="Output a 64 × 64 RGB image" focus="conv3-col conv4 conv4-k">{`The last transposed convolution produces **3 channels** at $64 \times 64$: the image $G(z)$.

Two exceptions to the rules above:
- **tanh instead of ReLU**, so pixel values lie in $[-1, 1]$, the same range the training images are scaled to. A bounded output let the model learn to cover the color range quickly.
- **No batch norm** on this layer. Normalizing the output (and the discriminator's input) made samples oscillate and training unstable.

The discriminator mirrors this network: strided convolutions that halve the resolution, LeakyReLU, and a single sigmoid output that says "real" or "generated" (see the Training tab).`}</Step>
  </Steps>
</Diagram>
