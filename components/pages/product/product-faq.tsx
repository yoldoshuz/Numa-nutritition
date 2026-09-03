import { Container } from "@/components/shared/container";
import { LeafDecor } from "@/components/shared/leaf-decor";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductContent } from "@/lib/api/blocks";

/**
 * Questions and answers about one product, written in the admin.
 *
 * There is no bundled fallback and none is wanted: the section exists only
 * when a moderator has something to answer, so a product with no FAQ block
 * simply does not have it — which is why this returns `null` rather than
 * rendering an empty state.
 */
export function ProductFaq({ content }: { content?: ProductContent }) {
  const faq = content?.faq;
  if (!faq) return null;

  return (
    <section className="relative isolate bg-surface-soft/60 py-14 lg:py-18">
      <LeafDecor position="left" />
      <Container>
        {faq.title && <SectionHeading align="center" title={faq.title} />}

        <Accordion className="mx-auto mt-8 max-w-3xl gap-2">
          {faq.items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="rounded-xl border border-line bg-white px-5 not-last:border-b"
            >
              <AccordionTrigger className="py-4 text-sm font-semibold text-ink hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[0.8125rem] leading-relaxed whitespace-pre-line text-muted-ink">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
