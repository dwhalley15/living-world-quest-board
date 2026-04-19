import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { motion, AnimatePresence } from 'framer-motion'
import QuestCard from './QuestCard'

interface QuestListProps {
  quests: Quest[]
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  characters: Character[]
}

export default function QuestList({
  quests,
  activeCharacter,
  setQuests,
  characters
}: QuestListProps) {
  if (quests.length === 0) {
    return (
      <div className="col-span-full text-center py-20">
        <p className="font-quest text-xl text-foreground/30">
          No quests available. Check back later or post a new quest if you are a
          God!
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeCharacter?.id || 'no-character'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12"
      >
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <QuestCard
              key={quest.id}
              quest={quest}
              activeCharacter={activeCharacter}
              setQuests={setQuests}
              characters={characters}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
