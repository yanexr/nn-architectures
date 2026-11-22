## How it works

A GAN trains two networks against each other. The **generator** $G$ maps noise $z$ to images; the **discriminator** $D$ tries to tell generated images from real ones:

$$
\min_G \max_D \; \mathbb{E}_{x \sim p_\text{data}}[\log D(x)] + \mathbb{E}_{z \sim p(z)}[\log(1 - D(G(z)))]
$$

DCGAN found an all-convolutional design that trains reliably:

- Replace pooling with **strided convolutions** (discriminator) and **fractionally-strided convolutions** (generator).
- Use **batch normalization** in both networks.
- Remove fully connected hidden layers.
- Use **ReLU** in the generator (tanh at the output) and **LeakyReLU** in the discriminator.

The generator starts from a 100-dimensional $z$, projects it to a $4 \times 4 \times 1024$ tensor and upsamples four times to a $64 \times 64$ RGB image.
