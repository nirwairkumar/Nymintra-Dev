import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "tween", ease: "easeOut" } }
};


const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 xl:py-40 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Decorative Pattern - Modern Indian/Mandala gradient hint */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl translate-x-[-30%] translate-y-[-30%]"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-[20%] translate-y-[20%]"
          />
          <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="container px-4 md:px-6 z-10 relative">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center space-y-8 text-center"
          >
            <motion.div variants={fadeInUp} className="space-y-4 max-w-3xl">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none text-foreground font-serif drop-shadow-sm">
                Design Your Dream <br />
                <span className="text-primary italic font-light drop-shadow-md">Invitation</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl font-sans mt-6 font-medium leading-relaxed">
                Beautiful, culturally rich printed cards for your most auspicious moments. Choose a design, customize in minutes, and we deliver to your doorstep.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 min-w-[200px] mt-8 pt-4">
              <Link
                to="/cards"
                className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-lg font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-primary/50 focus-visible:outline-none"
              >
                Start Designing Now
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm px-10 text-lg font-medium shadow-sm transition-all hover:bg-secondary/10 hover:border-secondary/50 focus-visible:outline-none"
              >
                How It Works
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="w-full py-20 md:py-32 bg-card/60 relative backdrop-blur-md border-y border-border/50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold tracking-tighter sm:text-5xl text-foreground font-serif">
              Celebrate Every Occasion
            </motion.h2>
            <motion.div variants={fadeInUp} className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
            <motion.p variants={fadeInUp} className="max-w-[900px] text-muted-foreground md:text-xl/relaxed mt-4">
              From grand weddings to intimate pujas, we have traditional and modern themes for your event.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { id: "wedding", name: "Wedding", icon: "💍", desc: "Grandeur & Elegance", color: "from-red-500/10 to-rose-500/5", glow: "group-hover:shadow-rose-500/20", text: "text-red-700 dark:text-red-400" },
              { id: "engagement", name: "Engagement", icon: "✨", desc: "A sparkling start", color: "from-amber-500/10 to-yellow-500/5", glow: "group-hover:shadow-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
              { id: "birthday", name: "Birthday", icon: "🎂", desc: "Joyous celebrations", color: "from-blue-500/10 to-cyan-500/5", glow: "group-hover:shadow-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
              { id: "puja", name: "Religious Puja", icon: "🪔", desc: "Auspicious blessings", color: "from-orange-500/10 to-amber-500/5", glow: "group-hover:shadow-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
            ].map((cat) => (
              <motion.div key={cat.id} variants={fadeInUp}>
                <Link to={cat.id === 'all' ? '/cards' : `/cards?category=${cat.id}`} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${cat.glow} flex flex-col items-center text-center gap-4`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10 p-5 rounded-full bg-background shadow-inner text-4xl transform transition-transform group-hover:scale-110 duration-500">
                    {cat.icon}
                  </div>
                  <div className="relative z-10">
                    <h3 className={`font-serif font-bold text-2xl mb-2 ${cat.text}`}>{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust / Easy Workflow Section */}
      <section className="w-full py-20 md:py-32 bg-accent relative overflow-hidden text-accent-foreground">
        {/* Subtle background motif for the dark accent area */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-serif text-white">
                Four Steps to <span className="text-secondary italic">Perfection</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="max-w-[600px] text-lg md:text-xl/relaxed text-white/80 font-light">
                We've made ordering high-quality, beautifully crafted invitations incredibly simple for your entire family.
              </motion.p>

              <motion.ul variants={staggerContainer} className="grid gap-8 mt-12">
                {[
                  { title: "Browse Gallery", desc: "Select from hundreds of curated Indian designs ranging from Royal Rajasthani to Minimalist Modern." },
                  { title: "Customize Easily", desc: "Type your details in English or Hindi. See real-time changes directly on the card." },
                  { title: "Review Live Preview", desc: "Check exactly how the printed card will look, with accurate colors and authentic fonts." },
                  { title: "Fast Delivery", desc: "Premium quality printing, carefully packaged and delivered rapidly to your home." },
                ].map((step, i) => (
                  <motion.li variants={fadeInUp} key={i} className="flex items-start gap-6 group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-serif text-xl font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <div className="mt-1">
                      <h3 className="font-semibold text-xl text-white mb-2">{step.title}</h3>
                      <p className="text-white/70 text-base leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right side interactive/animated mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="mx-auto rounded-2xl border border-white/20 overflow-hidden shadow-2xl bg-white/5 w-full aspect-[4/3] flex flex-col items-center justify-center backdrop-blur-md relative transform hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute top-4 left-4 right-4 flex gap-2 opacity-50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-3/4 aspect-[3/4] bg-white rounded-lg shadow-xl translate-y-4 flex flex-col items-center justify-center p-6 border-4 border-amber-100/20"
              >
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h4 className="font-serif text-primary text-2xl font-bold mb-2">Priya & Rahul</h4>
                <div className="w-1/2 h-px bg-secondary my-4" />
                <p className="text-xs text-center text-foreground/60 font-serif max-w-[80%]">
                  Invite you to share their joy as they tie the knot
                </p>
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
