import { Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
  const { t } = useTranslation();
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
        try {
            const res = await api.get('/settings/home_gallery_images');
            if (res.data?.value?.images?.length) {
                setGalleryImages(res.data.value.images);
            }
        } catch (e) {
            // Silently ignore if setting doesn't exist yet
        }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (galleryImages.length > 1) {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }
  }, [galleryImages]);

  const categories = [
    { id: "wedding", name: t('home.catWedding'), icon: "💍", desc: t('home.catWeddingDesc'), color: "from-red-500/10 to-rose-500/5", glow: "group-hover:shadow-rose-500/20", text: "text-red-700 dark:text-red-400" },
    { id: "engagement", name: t('home.catEngagement'), icon: "✨", desc: t('home.catEngagementDesc'), color: "from-amber-500/10 to-yellow-500/5", glow: "group-hover:shadow-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
    { id: "birthday", name: t('home.catBirthday'), icon: "🎂", desc: t('home.catBirthdayDesc'), color: "from-blue-500/10 to-cyan-500/5", glow: "group-hover:shadow-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
    { id: "puja", name: t('home.catPuja'), icon: "🪔", desc: t('home.catPujaDesc'), color: "from-orange-500/10 to-amber-500/5", glow: "group-hover:shadow-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
  ];

  const steps = [
    { title: t('home.step1Title'), desc: t('home.step1Desc') },
    { title: t('home.step2Title'), desc: t('home.step2Desc') },
    { title: t('home.step3Title'), desc: t('home.step3Desc') },
    { title: t('home.step4Title'), desc: t('home.step4Desc') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-10 pb-20 lg:pt-16 lg:pb-32 xl:pt-20 xl:pb-40 flex flex-col items-center justify-center text-center overflow-hidden">
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
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl/none text-foreground font-stylish drop-shadow-sm">
                {t('home.heroTitle1')} <br />
                <span className="text-primary font-cursive font-light drop-shadow-md">{t('home.heroTitle2')}</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl font-premium mt-6 font-medium leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 min-w-[200px] mt-8 pt-4">
              <Link
                to="/cards"
                className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-lg font-bold font-premium text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-primary/50 focus-visible:outline-none"
              >
                {t('home.ctaDesign')}
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm px-10 text-lg font-bold font-premium shadow-sm transition-all hover:bg-secondary/10 hover:border-secondary/50 focus-visible:outline-none"
              >
                {t('home.ctaHow')}
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
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground font-stylish">
              {t('home.categoriesTitle')}
            </motion.h2>
            <motion.div variants={fadeInUp} className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
            <motion.p variants={fadeInUp} className="max-w-[900px] text-muted-foreground md:text-xl/relaxed mt-4">
              {t('home.categoriesSubtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={fadeInUp}>
                <Link to={cat.id === 'all' ? '/cards' : `/cards?category=${cat.id}`} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${cat.glow} flex flex-col items-center text-center gap-4`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10 p-5 rounded-full bg-background shadow-inner text-4xl transform transition-transform group-hover:scale-110 duration-500">
                    {cat.icon}
                  </div>
                  <div className="relative z-10">
                    <h3 className={`font-bold text-2xl mb-2 ${cat.text} font-stylish`}>{cat.name}</h3>
                    <p className="text-sm text-muted-foreground font-premium">{cat.desc}</p>
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
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-stylish text-white">
                {t('home.workflowTitle')} <span className="text-secondary italic font-cursive">{t('home.workflowTitleHighlight')}</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="max-w-[600px] text-lg md:text-xl/relaxed text-white/80 font-premium">
                {t('home.workflowSubtitle')}
              </motion.p>

              <motion.ul variants={staggerContainer} className="grid gap-8 mt-12">
                {steps.map((step, i) => (
                  <motion.li variants={fadeInUp} key={i} className="flex items-start gap-6 group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-stylish text-xl font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <div className="mt-1">
                      <h3 className="font-semibold text-xl text-white mb-2 font-stylish">{step.title}</h3>
                      <p className="text-white/70 text-base leading-relaxed font-premium">{step.desc}</p>
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
                className="w-3/4 aspect-[3/4] bg-white rounded-lg shadow-xl translate-y-4 flex flex-col items-center justify-center border-4 border-amber-100/20 overflow-hidden relative"
              >
                  {galleryImages.length > 0 ? (
                      <AnimatePresence mode="wait">
                          <motion.img 
                              key={currentImageIndex}
                              src={galleryImages[currentImageIndex]}
                              initial={{ opacity: 0, scale: 1.02 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1, ease: "easeInOut" }}
                              alt="Showcase Gallery"
                              className="w-full h-full object-cover absolute inset-0"
                          />
                      </AnimatePresence>
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white">
                        <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-4">
                          <span className="text-2xl">🌿</span>
                        </div>
                        <h4 className="font-serif text-primary text-2xl font-bold mb-2">{t('home.mockupNames')}</h4>
                        <div className="w-1/2 h-px bg-secondary my-4" />
                        <p className="text-xs text-center text-foreground/60 font-serif max-w-[80%]">
                          {t('home.mockupText')}
                        </p>
                      </div>
                  )}
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
