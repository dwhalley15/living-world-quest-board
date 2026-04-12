import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Swords,
  Crown,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useMemo, useState } from 'react'
import QuestDetails from './QuestDetails'

interface QuestCardProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function QuestCard({
  quest,
  activeCharacter,
  setQuests,
}: QuestCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const formattedDate = new Date(quest.dateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const isGod = activeCharacter?.role === 'god'

  const fullParty = useMemo(
    () => quest.currentParty.length + (quest.partyLeader ? 1 : 0),
    [quest.currentParty.length, quest.partyLeader],
  )

  const isClaimed = quest.partyLeader !== null

  const isLeader = quest.partyLeader?.id === activeCharacter?.id

  return (
    <>
      <motion.div
        className="relative cursor-pointer"
        style={{ rotate: `${quest.rotation}deg` }}
        whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => {
          setModalOpen(true)
        }}
      >
        {/* Nail */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-iron border-2 border-iron/80 shadow-md z-10" />

        <div
          className="relative p-5 pt-6 min-h-[220px] parchment-shadow rounded-sm overflow-hidden"
          style={{
            backgroundImage: `url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/parchment.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {quest.isCompleted && (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="w-6 h-6 text-green-800/70" />
            </div>
          )}

          <h3 className="font-quest text-lg text-parchment-foreground leading-tight mb-2 pr-6">
            {quest.title}
          </h3>

          <p className="text-parchment-foreground/70 text-sm mb-3 line-clamp-2 font-body">
            {quest.description}
          </p>

          <div className="space-y-1.5 text-xs text-parchment-foreground/60">
            {quest.isCompleted && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{quest.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {fullParty}/{quest.partySize} adventurers
              </span>
            </div>
            {quest.partyLeader && (
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>{quest.partyLeader.name}</span>
              </div>
            )}
          </div>

          {!quest.isCompleted && activeCharacter && (
            <div className="mt-3 flex gap-2">
              {!isClaimed &&  (
                <div className="flex items-center gap-1 px-3 py-1 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 text-parchment-foreground text-xs font-display rounded transition-colors">
                  <Swords className="w-3 h-3" />
                  Claim
                </div>
              )}
              {isLeader && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 font-display text-xs rounded transition-colors">
                  <Swords className="w-3.5 h-3.5 rotate-180" />
                  Unclaim Quest
                </div>
              )}
              {isGod && quest.partyLeader != null && (
                <div className="flex items-center gap-1 px-3 py-1 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 text-parchment-foreground text-xs font-display rounded transition-colors">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </div>
              )}
            </div>
          )}

          {quest.isCompleted && quest.completionMessage && (
            <p className="mt-3 text-xs italic text-parchment-foreground/50 font-body border-t border-parchment-foreground/10 pt-2">
              "{quest.completionMessage}"
            </p>
          )}
        </div>
      </motion.div>

      <Modal
        title={quest.title}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <QuestDetails
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
        />
      </Modal>
    </>
  )
}
