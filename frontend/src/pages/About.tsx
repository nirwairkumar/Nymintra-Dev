"use client";

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 xl:py-40 bg-accent overflow-hidden text-accent-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight font-stylish">
              {t('about.title')}
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/80 font-premium leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-primary font-stylish">
              {t('about.heritageTitle')}
            </motion.h2>
            <motion.div variants={fadeInUp} className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p className="font-premium">{t('about.heritagePara1')}</p>
              <p className="font-premium">{t('about.heritagePara2')}</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-8 border-l-4 border-secondary bg-secondary/5 rounded-r-2xl">
              <h3 className="text-xl font-bold text-secondary mb-2 font-stylish">{t('about.visionTitle')}</h3>
              <p className="text-foreground/80 italic font-premium">{t('about.visionText')}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square"
          >
            <img 
              src="/images/about.png" 
              alt="Our Craft" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-card relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16 space-y-4"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-foreground font-stylish">
              {t('about.valuesTitle')}
            </motion.h2>
            <motion.div variants={fadeInUp} className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { title: t('about.valueQuality'), desc: t('about.valueQualityDesc'), icon: "💎" },
              { title: t('about.valueDesign'), desc: t('about.valueDesignDesc'), icon: "🎨" },
              { title: t('about.valueService'), desc: t('about.valueServiceDesc'), icon: "🤝" }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-background p-10 rounded-2xl border border-primary/10 shadow-sm hover:shadow-xl transition-shadow text-center group"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-4 font-stylish">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-premium">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-40 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground italic font-stylish">
            Begin Your Celebration with a Masterpiece.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/cards"
              className="inline-flex h-16 items-center justify-center rounded-full bg-primary px-12 text-xl font-bold font-premium text-primary-foreground shadow-xl hover:bg-primary/90 transition-all hover:scale-105"
            >
              Explore Collections
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-16 items-center justify-center rounded-full border-2 border-primary/20 bg-background px-12 text-xl font-bold font-premium shadow-sm hover:bg-secondary/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
