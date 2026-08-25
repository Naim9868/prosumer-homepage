import type { ComponentType } from "react";
import type { Block, BlockType } from "@/types/homepage";
import type { CatalogData } from "@/types/catalog";
import { HeadingBlock } from "@/components/blocks/heading-block";
import { ParagraphBlock } from "@/components/blocks/paragraph-block";
import { ImageBlock } from "@/components/blocks/image-block";
import { ButtonBlock } from "@/components/blocks/button-block";
import { SpacerBlock } from "@/components/blocks/spacer-block";
import { DividerBlock } from "@/components/blocks/divider-block";
import { ProductGridBlock } from "@/components/blocks/product-grid-block";
import { ProductSliderBlock } from "@/components/blocks/product-slider-block";
import { VideoBlock } from "@/components/blocks/video-block";
import { IconBlock } from "@/components/blocks/icon-block";
import { HtmlBlock } from "@/components/blocks/html-block";
import { CustomWidgetBlock } from "@/components/blocks/custom-widget-block";
import { ContainerBlock } from "@/components/blocks/container-block";

/**
 * Adding a new block type: create the component, add one line here.
 * Nothing that renders a CustomSection needs to change.
 */
export const BLOCK_REGISTRY: { [K in BlockType]: ComponentType<{ block: Block<K>; catalog?: CatalogData }> } = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  image: ImageBlock,
  button: ButtonBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  productGrid: ProductGridBlock,
  productSlider: ProductSliderBlock,
  video: VideoBlock,
  icon: IconBlock,
  html: HtmlBlock,
  customWidget: CustomWidgetBlock,
  container: ContainerBlock,
};
