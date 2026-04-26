import Article from '#/components/Article'
import BackButton from '#/components/BackButton'
import Header from '#/components/Header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  const privacy = [
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/scroll.png',
      imageAlignment: 'right',
      title: 'I. Of What Is Recorded',
      text: 'The Guild Scribes record only what is necessary for the forging of a character within the Hall. This includes a chosen name, a secured passphrase, and any likeness or sigil voluntarily provided by the adventurer. No further personal details are sought, demanded, or inscribed beyond these bounds.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/hood.png',
      imageAlignment: 'left',
      title: 'II. Of True Names and Hidden Identities',
      text: 'Adventurers are not required to reveal their true names, lineage, or worldly identity. The Guild does not seek such truths. Only the chosen identity within the Hall is known to the Scribes, and all external truths remain beyond the Guild’s gaze.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/potion.png',
      imageAlignment: 'right',
      title: 'III. Of Sigils, Likenesses, and Optional Marks',
      text: 'An adventurer may choose to provide a personal sigil or likeness to represent them within the Guildhall. Such images are kept solely for identification within the realm and are never sold, shared, or repurposed beyond Guild walls. No likeness is required to walk these halls.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/chest.png',
      imageAlignment: 'left',
      title: 'IV. Of External Messengers',
      text: 'An adventurer may optionally inscribe their messenger mark (such as a Discord sigil) to allow communication beyond the Guildhall. This mark is stored only for contact between Guild members and is never used for trade, sale, or unwanted summons.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/swords.png',
      imageAlignment: 'right',
      title: 'V. Of Passwords and Warded Access',
      text: 'Each adventurer’s passphrase is bound within a sealed ward. It is never visible to Scribes or Guildmasters, only the shadow of its truth preserved for verification. Should it be lost, even the Guild cannot retrieve it — for not even Scribes may peer into sealed wards.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/scroll.png',
      imageAlignment: 'left',
      title: 'VI. Of Silence, Retention, and Forgetting',
      text: 'The Guild retains only what is required for the adventurer’s continued presence within the Hall. No records are kept beyond necessity, and no hidden ledgers exist beyond this Codex. When an account is erased or forgotten, it is stricken from both ink and memory alike.',
    },
    {
      imageUrl:
        'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/hood.png',
      imageAlignment: 'right',
      title: 'VII. Of Protection Against Outside Hands',
      text: 'The Guild shall not sell, trade, or surrender any adventurer’s records to outside powers. Nor shall external forces be permitted to alter the Scribe’s Codex without consent and lawful decree. The Hall stands sealed against all who would misuse its records.',
    },
  ]

  return (
    <>
      <BackButton />
      <Header
        title="The Scribe’s Codex"
        subtitle="Recorded Under Seal of the Guild Archivists"
        text="Within these pages are recorded the limits of what the Guild may retain. Let it be known that only what is necessary for your passage through the Hall is ever inscribed, and all else is left unwritten in the void."
      />
      <section className="space-y-8">
        {privacy.map((policy, i) => (
          <Article
            key={i}
            index={i}
            title={policy.title}
            text={policy.text}
            imageUrl={policy.imageUrl}
            imageAlignment={policy.imageAlignment}
          />
        ))}
      </section>
    </>
  )
}
