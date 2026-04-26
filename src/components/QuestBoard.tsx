import { Scroll, Trophy, Plus, Swords } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import QuestList from './QuestList'
import Modal from './Modal'
import CreateQuestForm from './Forms/CreateQuestForm'

interface QuestBoardProps {
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  quests: Quest[]
  characters: Character[]
}

export default function QuestBoard({
  activeCharacter,
  quests,
  setQuests,
  characters,
}: QuestBoardProps) {
  const [activeTab, setActiveTab] = useState<
    'unclaimed' | 'inProgress' | 'completed'
  >('unclaimed')
  const [createOpen, setCreateOpen] = useState(false)

  const { unclaimedQuests, inProgressQuests, completedQuests } = useMemo(() => {
    const unclaimed: Quest[] = []
    const inProgress: Quest[] = []
    const completed: Quest[] = []

    for (const q of quests) {
      if (q.isCompleted) {
        completed.push(q)
      } else if (!q.partyLeader) {
        unclaimed.push(q)
      } else {
        inProgress.push(q)
      }
    }

    return {
      unclaimedQuests: unclaimed,
      inProgressQuests: inProgress,
      completedQuests: completed,
    }
  }, [quests])

  const isGod = activeCharacter?.role === 'god'

  return (
    <>
      <section>
        {isGod && (
          <div className="flex items-end justify-end mb-6">
            <motion.button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-display text-sm rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Post Quest
            </motion.button>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="grid grid-cols-2 w-full sm:flex gap-1 bg-secondary/50 backdrop-blur-sm rounded p-1 sm:w-auto">
            <button
              onClick={() => setActiveTab('unclaimed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-display transition-colors ${
                activeTab === 'unclaimed'
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground/50 hover:text-foreground/70'
              }`}
            >
              <Scroll className="w-4 h-4" />
              <h2>Unclaimed ({unclaimedQuests.length})</h2>
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-display transition-colors ${
                activeTab === 'inProgress'
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground/50 hover:text-foreground/70'
              }`}
            >
              <Swords className="w-4 h-4" />
              <h2>In Progress ({inProgressQuests.length})</h2>
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
              <h2>Completed ({completedQuests.length})</h2>
            </button>
          </div>
        </div>
        <QuestList
          quests={
            activeTab === 'unclaimed'
              ? unclaimedQuests
              : activeTab === 'inProgress'
                ? inProgressQuests
                : completedQuests
          }
          activeCharacter={activeCharacter}
          setQuests={setQuests}
          characters={characters}
        />
      </section>

      <Modal
        title="Post a New Quest"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="lg"
      >
        <CreateQuestForm
          activeCharacter={activeCharacter}
          onSuccess={(quest) => {
            setQuests((prev) => [quest, ...prev])
            setCreateOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
