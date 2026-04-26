import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import BackButton from '../components/BackButton'
import Article from '../components/Article'

export const Route = createFileRoute('/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  const terms = [
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/scroll.png',
      imageAlignment: 'right',
      title: 'I. The Binding of Conduct',
      text: 'By entering the Guild’s domain, all adventurers swear to uphold the Binding Pact. Conduct towards fellow players shall remain respectful and without malice. Harassment, abuse, or conduct intended to harm, deceive, or distress others is forbidden within the Hall and beyond it. The Guildmaster reserves the right to silence or expel any who violate this oath.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/hood.png',
      imageAlignment: 'left',
      title: 'II. Of Identity and Representation',
      text: 'No adventurer shall forge false likenesses or claim the identity of another. Profile sigils, portraits, and character visages must not be deceptive, offensive, or drawn from realms forbidden by the Guild (including likenesses of real-world persons without consent). All who enter must be represented truthfully in spirit, if not in flesh.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/swords.png',
      imageAlignment: 'right',
      title: 'III. Of Forbidden Manipulations',
      text: 'No soul shall attempt to exploit, break, or tamper with the workings of the Guild’s systems. This includes attempts to bypass protections, interfere with quests beyond intended means, or alter the sanctity of records and outcomes. Such acts are deemed violations of the Pact and may result in immediate banishment from Guild services.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/chest.png',
      imageAlignment: 'left',
      title: 'IV. Of Fair Use of the Guildhall',
      text: 'The Guildhall is a shared sanctuary. No adventurer shall misuse its services to cause harm, disruption, or dishonour to others. This includes spamming of missives, fraudulent postings upon the Quest Board, or attempts to deceive others for personal gain outside agreed trade.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/quil.png',
      imageAlignment: 'right',
      title: 'V. Of Shared Writings and Ownership',
      text: 'All writings, deeds, and creations recorded within the Guildhall remain subject to the rules of fair ownership and respect. No adventurer shall claim the works of another as their own, nor distribute another’s creations without consent where required by law or guild decree.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/banned.png',
      imageAlignment: 'left',
      title: 'VI. Of Prohibited Content and Dark Craft',
      text: 'The Guild forbids the creation or sharing of content that is obscene, unlawful, or harmful to others. This includes depictions of violence intended to disturb, content of an explicit nature, or material that violates the safety of the Guild and its members. The Guildmaster may remove such content without warning.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/swords.png',
      imageAlignment: 'right',
      title: 'VII. Of Security and the Integrity of the Realm',
      text: 'No adventurer shall attempt to breach the Guild’s protections, exploit vulnerabilities, or interfere with the sanctity of its systems. Any attempt to compromise the integrity of the Guildhall or its records is considered a grave violation of the Binding Pact.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/level.png',
      imageAlignment: 'left',
      title: 'VIII. Of Enforcement and Exile',
      text: 'The Guildmaster and appointed wardens hold final authority in interpreting and enforcing the Binding Pact. Breaches may result in warnings, restriction of access, or permanent exile from Guild services. All judgements are final, recorded, and bound into the Codex.',
    },
  ]
  return (
    <>
      <BackButton />
      <Header
        title="The Binding Pact"
        subtitle="Enforced by Decree of the Guildmaster"
        text="Let all who enter here be bound by oath and understanding. These terms govern conduct within the Guildhall and beyond its walls — and ignorance shall not be accepted as defence."
      />
      <section className="space-y-8">
        {terms.map((term, i) => (
          <Article
            key={i}
            index={i}
            title={term.title}
            text={term.text}
            imageUrl={term.imageUrl}
            imageAlignment={term.imageAlignment}
          />
        ))}
      </section>
    </>
  )
}
