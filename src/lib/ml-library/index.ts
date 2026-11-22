/**
 * The site's extra sidebar sections for the editor: ML tensors and layers,
 * editable networks, architecture blocks and a media library. Colors follow
 * the conventions in the nn-architectures skill (attention orange,
 * feed-forward sky, norms yellow, …).
 */
import type { LibrarySection } from "@nn-diagram/editor";
import { BLOCKS_SECTION } from "./blocks";
import { MEDIA_SECTIONS } from "./media";
import { NETWORKS_SECTION } from "./networks";
import { LAYERS_SECTION, TENSORS_SECTION } from "./shapes";

export const ML_LIBRARY: LibrarySection[] = [TENSORS_SECTION, LAYERS_SECTION, NETWORKS_SECTION, BLOCKS_SECTION, ...MEDIA_SECTIONS];
