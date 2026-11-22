/**
 * Media library: images for inputs and outputs of models (photos, scans,
 * signals, documents, plots) and colorful illustrations. The files live in
 * `public/media/`; inserting one copies it next to the diagram
 * (diagrams reference media by relative path, never embedded).
 *
 * To replace a placeholder, put the new file in public/media/ and change
 * `file` below (e.g. "dog.svg" → "dog.webp"). See public/media/README.md.
 */
import { libraryItem as item, type LibraryItem, type LibrarySection } from "@nn-diagram/editor";
import { BASE_PATH } from "../base-path";

export interface MediaEntry {
  id: string;
  label: string;
  file: string;
  /** Natural aspect (w × h) used for the inserted image, in px on the 4 px grid. */
  size: [number, number];
  keywords: string;
}

type Group = { id: string; title: string; entries: MediaEntry[] };

const m = (id: string, label: string, file: string, size: [number, number], keywords = ""): MediaEntry => ({ id, label, file, size, keywords });

export const MEDIA_GROUPS: Group[] = [
  {
    id: "media-vision",
    title: "Data · images & video",
    entries: [
      m("dog", "Dog", "dog.webp", [96, 96], "photo animal pet input classification"),
      m("cat", "Cat", "cat.webp", [96, 96], "photo animal pet input classification"),
      m("bird", "Bird", "bird.webp", [96, 96], "photo animal vit"),
      m("face", "Face", "face.webp", [96, 96], "portrait person photo identity"),
      m("face-2", "Face (2)", "face-2.webp", [96, 96], "portrait person photo identity gan generated sample"),
      m("car", "Car", "car.webp", [128, 96], "vehicle photo"),
      m("landscape", "Landscape", "landscape.webp", [128, 96], "nature photo scene"),
      m("satellite", "Satellite image", "satellite.webp", [96, 96], "aerial remote sensing earth"),
      m("digit", "Handwritten digit", "digit.svg", [64, 64], "mnist number"),
      m("street", "Street scene", "street.webp", [128, 96], "driving city photo"),
      m("street-detection", "Object detection", "street-object-detection.webp", [128, 96], "bounding boxes street detection"),
      m("street-segmentation", "Segmentation", "street-segmentation.webp", [128, 96], "semantic mask labels street"),
      m("street-depth", "Depth map", "street-depth-grey.webp", [128, 96], "depth estimation street grayscale"),
      m("room", "Indoor scene", "room.webp", [128, 96], "interior photo scene"),
      m("room-depth", "Depth map (color)", "room-depth.webp", [128, 96], "depth estimation indoor"),
      m("bird-patches", "Image patches", "bird-patches.webp", [96, 96], "vit patchify grid split"),
      m("bird-patch-sequence", "Patch sequence", "bird-patch-sequence.webp", [224, 24], "vit patches flattened row tokens"),
      m("image-samples", "Image batch", "image-samples.webp", [96, 96], "stack samples dataset batch photos"),
      m("video-frames", "Video frames", "video-frames.webp", [192, 48], "clip sequence temporal"),
      m("point-cloud", "Point cloud", "point-cloud.svg", [96, 96], "3d lidar points"),
    ],
  },
  {
    id: "media-generative",
    title: "Data · diffusion",
    entries: [
      m("astronaut", "Generated image", "astronaut-riding-a-horse-on-mars.webp", [96, 96], "astronaut horse mars text-to-image x0 clean sample"),
      m("astronaut-noisy-1", "Noised (little)", "astronaut-noisy-1.webp", [96, 96], "diffusion forward step x_t"),
      m("astronaut-noisy-2", "Noised (heavy)", "astronaut-noisy-2.webp", [96, 96], "diffusion forward step x_t"),
      m("noise", "Gaussian noise", "noise.png", [96, 96], "diffusion random pure noise x_T"),
    ],
  },
  {
    id: "media-science",
    title: "Data · health & science",
    entries: [
      m("xray", "Chest X-ray", "xray.webp", [96, 96], "medical radiology scan"),
      m("mri", "Brain MRI", "mri.webp", [96, 96], "medical scan neuro"),
      m("histology", "Histology slide", "histology.webp", [96, 96], "pathology tissue medical"),
      m("cells", "Cells (microscopy)", "cells.webp", [96, 96], "biology microscope fluorescence"),
      m("ecg", "ECG", "ecg.svg", [160, 64], "heart signal medical cardio"),
      m("eeg", "EEG", "eeg.svg", [160, 96], "brain signal channels medical"),
      m("dna", "DNA", "dna.webp", [64, 96], "genome helix biology"),
      m("dna-sequence", "DNA sequence", "dna-sequence.svg", [160, 32], "genome bases acgt"),
      m("protein", "Protein structure", "protein.webp", [96, 96], "alphafold fold 3d"),
      m("molecule", "Molecule", "molecule.svg", [96, 96], "chemistry graph atoms"),
    ],
  },
  {
    id: "media-signals",
    title: "Data · audio, signals & time series",
    entries: [
      m("waveform", "Audio waveform", "waveform.svg", [160, 48], "sound speech music"),
      m("spectrogram", "Spectrogram", "spectrogram.webp", [160, 80], "mel audio frequency"),
      m("time-series", "Time series", "time-series.svg", [160, 64], "signal sensor"),
      m("multivariate", "Multivariate time series", "multivariate.svg", [160, 80], "channels sensors"),
      m("anomaly", "Time series with anomaly", "anomaly.svg", [160, 64], "anomaly detection outlier"),
      m("forecast", "Forecast", "forecast.svg", [160, 64], "prediction uncertainty horizon"),
    ],
  },
  {
    id: "media-text",
    title: "Data · text, code & web",
    entries: [
      m("document", "Document", "document.svg", [72, 96], "text page pdf"),
      m("code", "Source code", "code.svg", [128, 96], "program"),
      m("chat", "Chat", "chat.svg", [96, 96], "conversation dialogue llm assistant"),
      m("webpage", "Web page", "webpage.svg", [128, 96], "browser html screenshot ui"),
      m("table-data", "Tabular data", "table-data.svg", [128, 80], "spreadsheet csv rows"),
    ],
  },
  {
    id: "media-env",
    title: "Data · robotics & environments",
    entries: [
      m("robot-arm", "Robot arm", "robot-arm.webp", [96, 96], "robotics manipulation vla"),
      m("game", "Game frame", "game.webp", [96, 96], "atari pacman reinforcement learning environment"),
    ],
  },
  {
    id: "media-plots",
    title: "Plots",
    entries: [
      m("loss-curve", "Loss curve", "loss-curve.svg", [128, 80], "training validation chart"),
      m("clusters", "Embedding clusters", "clusters.svg", [96, 96], "tsne umap scatter latent space"),
      m("distribution", "Gaussian", "distribution.svg", [128, 64], "normal density probability"),
      m("bars", "Probabilities", "bars.svg", [96, 64], "softmax histogram top-k bar chart"),
      m("decision-boundary", "Decision boundary", "decision-boundary.svg", [96, 96], "classifier two classes"),
      m("heatmap", "Heatmap", "heatmap.png", [96, 96], "attention map matrix"),
    ],
  },
  {
    id: "media-illustrations",
    title: "Illustrations",
    entries: [
      m("brain", "Brain", "brain.svg", [48, 48], "neural intelligence mind illustration"),
      m("robot", "Robot", "robot.svg", [48, 48], "agent bot assistant ai illustration"),
      m("user", "User", "user.svg", [48, 48], "person human customer illustration"),
      m("eye", "Eye", "eye.svg", [48, 48], "vision perception observe illustration"),
      m("gpu", "GPU", "gpu.svg", [48, 48], "hardware compute accelerator training illustration"),
      m("cpu", "CPU", "cpu.svg", [48, 48], "chip processor hardware illustration"),
      m("server", "Server", "server.svg", [48, 48], "rack cluster inference serving illustration"),
      m("database", "Database", "database.svg", [48, 48], "storage vector store retrieval illustration"),
      m("cloud", "Cloud", "cloud.svg", [48, 48], "api service hosted illustration"),
      m("layers", "Layers", "layers.svg", [48, 48], "stack model layers illustration"),
      m("gear", "Gear", "gear.svg", [48, 48], "settings process pipeline tool illustration"),
      m("puzzle", "Puzzle", "puzzle.svg", [48, 48], "plugin module tool component illustration"),
      m("link", "Link", "link.svg", [48, 48], "connection reference url illustration"),
      m("lightning", "Lightning", "lightning.svg", [48, 48], "fast speed energy illustration"),
      m("fire", "Fire", "fire.svg", [48, 48], "trainable trained hot illustration"),
      m("snowflake", "Snowflake", "snowflake.svg", [48, 48], "frozen pretrained illustration"),
    ],
  },
];

const ENTRIES = new Map(MEDIA_GROUPS.flatMap((g) => g.entries).map((e) => [e.id, e]));

export const mediaUrl = (file: string) => `${BASE_PATH}/media/${file}`;

/** An Image element for a media entry, plus the asset map the library item needs. */
export function mediaImage(id: string, props: { x?: number; y?: number; w?: number; h?: number; extra?: string } = {}): { jsx: string; assets: Record<string, string> } {
  const e = ENTRIES.get(id);
  if (!e) throw new Error(`Unknown media "${id}"`);
  const [w, h] = [props.w ?? e.size[0], props.h ?? e.size[1]];
  return {
    jsx: `<Image x={${props.x ?? 0}} y={${props.y ?? 0}} w={${w}} h={${h}} src="${e.file}"${props.extra ?? ""} />`,
    assets: { [e.file]: mediaUrl(e.file) },
  };
}

export const mergeAssets = (...maps: Record<string, string>[]) => Object.assign({}, ...maps) as Record<string, string>;

export const MEDIA_SECTIONS: LibrarySection[] = MEDIA_GROUPS.map((g) => ({
  id: g.id,
  title: g.title,
  items: g.entries.map((e): LibraryItem => {
    const { jsx, assets } = mediaImage(e.id);
    return item(`media-${e.id}`, e.label, jsx, `${e.keywords} image media`, assets);
  }),
}));
