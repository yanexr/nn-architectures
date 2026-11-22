// Adversarial training of DCGAN: the generator and the discriminator are trained against each other.
<Diagram width={864} height={392} grid={4} title="DCGAN training">
  <Text x={24} y={20} variant="caption">Adversarial training</Text>

  <Box id="noise" x={24} y={80} w={56} h={48} variant="gray" tip={`A fresh batch of noise vectors $z$ (100 numbers each, uniform distribution) is drawn for every training step, so the generator never sees the same input twice.`}>
    <Math tex="z" />
  </Box>
  <Text x={8} y={132} w={88} h={20} variant="label" className="justify-center">noise</Text>
  <Box id="gen" x={120} y={64} w={144} h={80} shape="trapezoid" narrow="left" inset={0.2} variant="blue" link="#generator.diagram.jsx" tip={`The **generator** $G$: a projection and four transposed convolutions that turn $z$ into a $64 \times 64$ image (the Generator tab shows its layers). It never sees a real image; everything it learns comes through the discriminator's gradients.`}>
    Generator <Math tex="G" />
  </Box>
  <Box id="fake" x={304} y={84} w={112} h={40} variant="stone" tip={`Generated images $G(z)$, pixel values in $[-1, 1]$ (tanh output).`}>
    <Math tex="G(z)" />
  </Box>
  <Text x={304} y={60} w={112} h={20} variant="label" className="justify-center">generated</Text>
  <Box id="real" x={304} y={180} w={112} h={40} variant="stone" tip={`A batch of real training images, e.g. from LSUN bedrooms (about 3 million photos). The only preprocessing is scaling the pixels to $[-1, 1]$ to match the generator's tanh output; no data augmentation.`}>
    <Math tex="x" />
  </Box>
  <Text x={304} y={224} w={112} h={20} variant="label" className="justify-center">real images</Text>
  <Box id="disc" x={456} y={80} w={144} h={128} shape="trapezoid" narrow="right" inset={0.2} variant="blue" tip={`The **discriminator** $D$ mirrors the generator: strided convolutions halve the resolution step by step (no pooling), batch norm everywhere except the input layer, and **LeakyReLU** (slope 0.2) so that gradients still flow for negative inputs. The last feature map is flattened into a single sigmoid output.`}>
    Discriminator <Math tex="D" />
  </Box>
  <Box id="prob" x={640} y={124} w={96} h={40} variant="green" tip={`A single number in $(0, 1)$: the discriminator's estimate that its input is a real image. Ideally close to 1 for $x$ and close to 0 for $G(z)$.`}>
    <Math tex="D(\cdot)" />
  </Box>
  <Text x={744} y={124} w={104} h={40} variant="label">probability<br />“real”</Text>
  <Box id="loss" x={456} y={292} w={384} h={48} variant="red" tip={`The GAN objective (Goodfellow et al., 2014). $D$ maximizes it: high $D(x)$ for real images, low $D(G(z))$ for fakes. $G$ minimizes it: it wants $D(G(z))$ to be high. In practice $G$ maximizes $\log D(G(z))$ instead, which gives stronger gradients early on, when $D$ easily rejects the fakes.`}>
    <Math tex="\min_G \max_D \; \mathbb{E}_x[\log D(x)] + \mathbb{E}_z[\log(1 - D(G(z)))]" />
  </Box>

  <Arrow from="noise" to="gen" />
  <Arrow from="gen" to="fake" />
  <Arrow from="fake" to="disc@left:24px" />
  <Arrow from="real" to="disc@left:120px" />
  <Arrow from="disc" to="prob" />
  <Arrow from="prob" to="loss@top:232px" />
  <Arrow from="loss@top:72px" to="disc@bottom:72px" variant="red" dashed tip="Gradient step on the discriminator's weights only.">update <Math tex="D" /></Arrow>
  <Arrow from="loss@left" to="gen@bottom" via={[[192, 316]]} variant="red" dashed labelAt={0.35} tip="Gradient step on the generator's weights only. The gradient flows back through the (fixed) discriminator into the generated image and from there into $G$.">update <Math tex="G" /></Arrow>

  <Steps>
    <Step title="Generate a batch of fakes" focus="noise gen fake">{`Each step starts by sampling a batch of 128 noise vectors $z$ and running them through the generator. The result is a batch of images $G(z)$.

The generator gets **no direct signal** about what images should look like. It only learns from how the discriminator reacts to its output.`}</Step>
    <Step title="Show real and fake images to D" focus="fake real disc prob">{`The discriminator receives real images $x$ and generated images $G(z)$ and outputs, for each one, the probability $D(\cdot)$ that it is real.

It is an ordinary CNN classifier with two classes. What makes it special is that the "fake" class keeps changing, because the generator improves at the same time.`}</Step>
    <Step title="Update the discriminator" focus="prob loss disc">{`$D$ takes a gradient step to **increase** the objective: push $D(x)$ toward 1 and $D(G(z))$ toward 0. This is the usual binary cross-entropy loss of a classifier.

A better discriminator means more useful feedback for the generator: its gradients point to what still gives the fakes away.`}</Step>
    <Step title="Update the generator" focus="loss gen">{`$G$ takes a gradient step to make $D(G(z))$ **larger**: the gradient flows back through the discriminator (whose weights are held fixed in this step) into the pixels of $G(z)$, and from there into the generator's weights.

The two networks play a minimax game. In the ideal end state the generated images are indistinguishable from real ones and $D$ outputs $\tfrac{1}{2}$ everywhere.`}</Step>
    <Step title="What made it stable" focus="gen disc">{`Before DCGAN, convolutional GANs were notoriously hard to train. The paper's recipe:

- strided convolutions instead of pooling, and no fully connected hidden layers;
- batch norm in both networks, except the generator's output and the discriminator's input;
- ReLU in $G$ (tanh at the output), LeakyReLU with slope 0.2 in $D$;
- Adam with learning rate $0.0002$ and $\beta_1 = 0.5$ (the default 0.9 made training oscillate), weights initialized from $\mathcal{N}(0, 0.02)$, batch size 128.

Afterwards the discriminator's features turned out to be good general image features: a linear classifier on them reached 82.8 % accuracy on CIFAR-10.`}</Step>
  </Steps>
</Diagram>
