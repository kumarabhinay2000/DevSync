import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Reveal } from '@/components/domain/Reveal'
import { SectionHeading } from './SectionHeading'

const faqs = [
  {
    q: 'How are answers grounded in my code?',
    a: 'DevSync AI retrieves relevant indexed source and links answers to specific files and revisions.',
  },
  {
    q: 'Can I review changes before they are applied?',
    a: 'Yes. Proposed changes appear as an exact diff alongside test outcomes. An authorized reviewer approves that exact patch before an authorized pull request is created. Nothing is merged or deployed automatically.',
  },
  {
    q: 'How is repository access controlled?',
    a: 'Access follows explicit project permissions on top of workspace membership. Workspace administration alone does not grant access to source code.',
  },
  {
    q: 'Can I connect my existing tools?',
    a: 'DevSync AI is designed to work with GitHub and SonarQube, and approved tools can be connected through MCP behind a policy gateway. REST and gRPC interfaces support integration.',
  },
]

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-24">
      <div className="container-page max-w-[1040px]">
        <SectionHeading id="faq-title" title="A few things worth knowing." />

        <Reveal className="mt-12" delay={100}>
          <Accordion type="single" collapsible defaultValue="faq-0">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
