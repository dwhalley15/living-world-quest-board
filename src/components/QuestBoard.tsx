import { Scroll, Trophy, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import QuestList from './QuestList'

interface QuestBoardProps {
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  quests: Quest[]
}

export default function QuestBoard({
  activeCharacter,
  quests,
  setQuests,
}: QuestBoardProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [createOpen, setCreateOpen] = useState(false)
  const activeQuests = quests.filter((q) => !q.isCompleted)
  const completedQuests = quests.filter((q) => q.isCompleted)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-secondary/50 backdrop-blur-sm rounded p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-display transition-colors ${
              activeTab === 'active'
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/50 hover:text-foreground/70'
            }`}
          >
            <Scroll className="w-4 h-4" />
            Active ({activeQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-display transition-colors ${
              activeTab === 'completed'
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/50 hover:text-foreground/70'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Completed ({completedQuests.length})
          </button>
        </div>

        {activeCharacter && activeCharacter.class === 'God' && (
          <motion.button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-display text-sm rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Post Quest
          </motion.button>
        )}
      </div>
      <QuestList
        quests={activeTab === 'active' ? activeQuests : completedQuests}
        activeCharacter={activeCharacter}
        setQuests={setQuests}
      />
    </section>
  )
}
