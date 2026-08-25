import type { ComponentType } from "react";
import type { BlockType, BlockSettingsMap } from "@/types/homepage";
import {
  HeadingBlockEditor,
  ParagraphBlockEditor,
  ImageBlockEditor,
  ButtonBlockEditor,
  SpacerBlockEditor,
  DividerBlockEditor,
  ProductGridBlockEditor,
  ProductSliderBlockEditor,
  VideoBlockEditor,
  IconBlockEditor,
  HtmlBlockEditor,
  CustomWidgetBlockEditor,
  ContainerBlockEditor,
} from "@/components/homepage-builder/block-editors";

type EditorProps<K extends BlockType> = { settings: BlockSettingsMap[K]; onChange: (next: BlockSettingsMap[K]) => void };

/** Adding a new block's editor: create the component, add one line here. */
export const BLOCK_EDITOR_REGISTRY: { [K in BlockType]: ComponentType<EditorProps<K>> } = {
  heading: HeadingBlockEditor,
  paragraph: ParagraphBlockEditor,
  image: ImageBlockEditor,
  button: ButtonBlockEditor,
  spacer: SpacerBlockEditor,
  divider: DividerBlockEditor,
  productGrid: ProductGridBlockEditor,
  productSlider: ProductSliderBlockEditor,
  video: VideoBlockEditor,
  icon: IconBlockEditor,
  html: HtmlBlockEditor,
  customWidget: CustomWidgetBlockEditor,
  container: ContainerBlockEditor,
};
