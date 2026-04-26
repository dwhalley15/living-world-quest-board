import { motion } from 'motion/react'

interface ArticleProps {
  title?: string
  text?: string
  imageUrl?: string
  imageAlignment?: string
  index?: number
}

export default function Article({
  title,
  text,
  imageUrl,
  imageAlignment = 'left',
  index = 0,
}: ArticleProps) {
  return (
    <motion.article
      key={title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05 }}
      style={{ transform: `rotate(${index % 2 === 0 ? -0.4 : 0.4}deg)` }}
      className="relative bg-[hsl(var(--parchment))] text-[hsl(var(--parchment-foreground))] parchment-shadow px-6 md:px-10 py-8"
    >
      {/* corner pins */}
      <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-iron shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.5)]" />
      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-iron shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.5)]" />
      <span className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-iron shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.5)]" />
      <span className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-iron shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.5)]" />

      <div
        className={`flex flex-col md:flex-row gap-6 items-center md:items-start ${
          imageAlignment === 'right' ? 'md:flex-row-reverse' : ''
        }`}
      >
        <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              width={512}
              height={512}
              loading="lazy"
              className="w-full h-full object-contain mix-blend-multiply opacity-90"
            />
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          {title && (
            <h2 className="font-quest text-2xl md:text-3xl mb-3">{title}</h2>
          )}

          <div className="h-px w-24 opacity-30 mb-3 mx-auto md:mx-0" />

          {text && (
            <p className="font-body text-base md:text-lg leading-relaxed opacity-85">
              {text}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  )
}
