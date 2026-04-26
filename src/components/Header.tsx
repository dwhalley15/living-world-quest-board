import { motion } from 'motion/react';
import { Feather } from 'lucide-react';

interface HeaderProps {
  title?: string
  subtitle?: string
  text?: string
}

export default function Header({ title, subtitle, text }: HeaderProps ) {
  return (
    <header className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <motion.div
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {subtitle && (
            <span className='inline-flex items-center gap-3 text-primary/80 mb-2 font-quest text-sm tracking-widest uppercase'>
              <Feather className="w-4 h-4 inline-block mr-1" />
              {subtitle}
              <Feather className="w-4 h-4 inline-block ml-1 scale-x-[-1]" />
            </span>
          )}
          {title && (
            <h1 className="font-quest text-5xl md:text-6xl text-glow text-primary tracking-wide">
            {title}
          </h1>
          )}
          
          {text && (
            <p className="font-body text-foreground/50 mt-2 text-lg italic">
              {text}
            </p>
          )}
        </motion.div>
    </header>
  )
}
