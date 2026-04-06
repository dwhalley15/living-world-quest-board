import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <motion.div
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-quest text-5xl md:text-6xl text-glow text-primary tracking-wide">
            Quest Board
          </h1>
          <p className="font-body text-foreground/50 mt-2 text-lg italic">
            Seek glory, find adventure
          </p>
        </motion.div>
    </header>
  )
}
