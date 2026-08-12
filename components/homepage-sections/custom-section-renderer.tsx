import { SectionWrapper } from "@/components/shared/section-wrapper";
import { BLOCK_REGISTRY } from "@/registry/block-registry";
import type { CatalogData } from "@/types/catalog";
import type { CustomSection } from "@/types/homepage";

export function CustomSectionRenderer({
  section,
  catalog,
}: {
  section: CustomSection;
  catalog?: CatalogData;
}) {
  const blocks = [...section.blocks].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper style={section.style}>
      <div className="flex flex-col gap-6">
        {blocks.map((block) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Component = BLOCK_REGISTRY[block.type] as any;
          if (!Component) return null;
          return <Component key={block.id} block={block} catalog={catalog} />;
        })}
      </div>
    </SectionWrapper>
  );
}
