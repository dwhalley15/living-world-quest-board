import { motion } from 'motion/react';
import { Feather, MessageCircle, Scroll, ScrollText, Shield } from 'lucide-react';

export default function Footer() {

  const links = [
  { icon: Shield, label: "Code of the Guild", subtitle: "Server Rules", href: "/rules" },
  { icon: ScrollText, label: "The Binding Pact", subtitle: "Terms of Service", href: "/terms" },
  { icon: Scroll, label: "Scribe's Codex", subtitle: "Privacy Decree", href: "/privacy" },
  { icon: MessageCircle, label: "The Tavern", subtitle: "Join us on Discord", href: "https://discord.gg/G6cznGXECx" },
];

  return (
    <footer className="relative z-10 mt-12 border-t-2 border-primary/20 mt-auto">
      {/* Iron rivets row */}
      <div className="flex justify-between px-8 py-2 bg-wood/40 backdrop-blur-sm">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-iron shadow-[inset_0_1px_2px_hsl(0_0%_0%/0.6),0_1px_1px_hsl(38_80%_55%/0.2)]"
          />
        ))}
      </div>

        <div className="bg-gradient-to-b from-wood/60 to-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Heading scroll */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 text-primary/80">
              <Feather className="w-5 h-5" />
              <h2 className="font-quest text-2xl text-glow tracking-wide">
                Notices from the Guildhall
              </h2>
              <Feather className="w-5 h-5 -scale-x-100" />
            </div>
            <div className="mx-auto mt-2 h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>

          {/* Links as parchment notes */}
          <nav className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {links.map((link, i) => {
              const Icon = link.icon;
              const rotation = (i % 2 === 0 ? -1 : 1) * (1 + (i % 3) * 0.5);
              const isExternal = link.href.startsWith("https");
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ rotate: 0, scale: 1.04, y: -2 }}
                  style={{ rotate: `${rotation}deg` }}
                  className="group relative block px-4 py-3 text-center bg-[hsl(var(--parchment))] text-[hsl(var(--parchment-foreground))] shadow-[0_4px_12px_hsl(0_0%_0%/0.5)] transition-shadow hover:shadow-[0_6px_20px_hsl(38_80%_55%/0.35)]"
                >
                  {/* pin */}
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-destructive shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.5),0_1px_2px_hsl(0_0%_0%/0.6)]" />
                  <Icon className="w-5 h-5 mx-auto mb-1 opacity-70 group-hover:opacity-100" />
                  <div className="font-quest text-base leading-tight">{link.label}</div>
                  <div className="font-body italic text-xs opacity-60 mt-0.5">
                    {link.subtitle}
                  </div>
                </motion.a>
              );
            })}
          </nav>

          {/* Wax seal / colophon */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-destructive to-[hsl(0_70%_30%)] flex items-center justify-center shadow-[0_4px_10px_hsl(0_0%_0%/0.6),inset_0_2px_4px_hsl(0_80%_70%/0.4)]">
              <span className="font-quest text-xl text-[hsl(40_30%_90%)]">Q</span>
              <span className="absolute inset-0 rounded-full border border-[hsl(40_30%_90%/0.2)]" />
            </div>
            <p className="font-body italic text-sm text-foreground/40 text-center">
              Sealed by the Adventurer's Guild · Anno {new Date().getFullYear()} of the Realm
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
