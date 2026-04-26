import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import BackButton from '../components/BackButton'
import Article from '../components/Article'

export const Route = createFileRoute('/rules')({
  component: RouteComponent,
})

function RouteComponent() {
  const rules = [
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/swords.png',
    imageAlignment: 'right',
    title: 'I. Of Quests and the Will of the Guildmaster',
    text: "Quests shall be proclaimed upon the Guild Board, and adventurers may choose their intended undertakings. A single soul may pledge to many calls, yet fate is fickle — for misfortune, death, or capture may bar future ventures. The Guildmaster holds final judgement on all party compositions and may refuse or reassign any who seek the same contract.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/chest.png',
    imageAlignment: 'left',
    title: 'II. Of Spoils, Trade, and the Sharing of Reward',
    text: "All treasure gained upon a quest shall be divided amongst the party by mutual accord before departure or upon return. No adventurer may claim greater share without consent of the others. Trade, barter, and exchange between guildmembers are permitted only when both parties willingly agree. Should a companion fall, their remaining possessions become rightful loot of the survivors, and none may later reclaim what has been abandoned.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/swords.png',
    imageAlignment: 'right',
    title: 'III. Of Peace Within the Guildhall',
    text: "No blade shall be drawn, nor harm inflicted upon another guildmember within the Hall. Disputes must be brought before the Guildmaster for judgement. Likewise, no quarrel between adventurers shall escalate into violence in the field — for the spilling of guild-blood is forbidden. Those who break this sacred peace shall be cast out and forfeit their standing.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/potion.png',
    imageAlignment: 'left',
    title: 'IV. Of Life, Death, and the Limits of Return',
    text: "Healing draughts may be consumed with deliberate action, or administered to another in the same manner. When struck by fate’s cruel hand, warriors may bear lasting scars as marks of surviving great foes. Should a named or terrible enemy strike a critical blow, wounds shall linger as both memory and warning. The Shield may turn aside doom for a single strike only. The dead among non-player folk may linger briefly at death’s door, but beyond that final breath they are gone forever — no return, no recall, no resurrection.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/scroll.png',
    imageAlignment: 'right',
    title: 'V. Of Honour, Command, and the Conduct of Quests',
    text: "Once a party is formed, their bond is sealed by the ink of the Board. None shall abandon their companions nor falsely claim deeds not their own. The Dungeon Master holds final authority in all matters of questing, and the course of any adventure may shift by their decree. All expeditions are governed strictly by the 2024 codex and its sanctioned writings alone.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/hood.png',
    imageAlignment: 'left',
    title: 'VI. Of Arcane Limits and the Order of the Fallen',
    text: "The arts of resurrection are forbidden within these halls and beyond them — no Revivify, Raise Dead, Resurrection, nor True Resurrection shall return the departed to the living world. Guidance may be invoked even amidst chaos as a reflex of will. The Shield’s ward protects but a single strike before fading. All who perish beyond mortal means are lost to legend, and none may call them back from the dark.",
  },
   {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/level.png',
    imageAlignment: 'right',
    title: 'VII. Of Growth and the Ascension of Heroes',
    text: "All adventurers begin their journey at the third tier of experience, already tempered by prior trials. Advancement beyond this point is not earned by individual tally alone, but by the shared progression of the world itself. When great milestones are reached across the realm, all active heroes shall ascend together in strength, bound by the fate of the unfolding world.",
  },
  {
    imageUrl: 'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/banned.png',
    imageAlignment: 'left',
    title: 'VIII. The Banished Arts',
    text: "Certain magicks and invocations are deemed too disruptive to the balance of the realm and are hereby forbidden within all sanctioned play. The following are struck from permissible lore: Circle Casting (as taught in Heroes of Faerûn), Silvery Barbs (as recorded in Strixhaven), and Sylune’s Viper (as recorded in Heroes of Faerûn). Any who attempt to wield such arts shall be warned once; continued defiance may result in removal from guild proceedings.",
  },
]
  return (
    <>
      <BackButton />
      <Header
        title="Code of the Guild"
        subtitle="Posted by Order of the Guildmaster"
        text="Let these decrees be known to every soul who passes through our doors, from the lowliest squire to the most storied champion."
      />
      <section className="space-y-8">
        {rules.map((rule, i) => (
          <Article
            key={i}
            index={i}
            title={rule.title}
            text={rule.text}
            imageUrl={rule.imageUrl}
            imageAlignment={rule.imageAlignment}
          />
        ))}
      </section>
    </>
  )
}
