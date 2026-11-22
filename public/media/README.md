# Media library

Images offered in the editor's "Data · …", "Plots" and "Illustrations" sections
(manifest: `src/lib/ml-library/media.ts`). Inserting one copies the
file next to the diagram, which references it by relative path (`src="dog.webp"`),
so a saved diagram folder is self-contained.

To add or replace a file: put it here and add or change its entry in the
manifest. Blocks that use an image pick a new file name up automatically.
Keep files small: they are copied into every diagram that uses them.

- Photos and scans: WebP, about 512 px on the long side, the aspect of `size` in the manifest. Square corners (the diagram can round them with `rounded-*`).
- Plots and signals: SVG with a transparent background and mid-tone colors (they must read on light and dark pages).
- Illustrations: flat, colorful SVGs, square (`brain.svg`, `gpu.svg`, `robot.svg`, …).

Derived files (made from the photos with a Python/Pillow script): `astronaut-noisy-1/2.webp`
(forward diffusion steps between the astronaut and `noise.png`), `bird-patches.webp`,
`bird-patch-sequence.webp`, `image-samples.webp` and `molecule.svg`.

Ideas for more: MNIST grid, ImageNet-style mosaic, optical flow, sheet music,
galaxy, weather map, keyboard (text input), microphone, speaker.
