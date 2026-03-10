import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 xl:py-40 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Decorative Pattern - Abstract Mandala or Floral Hint */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-x-[-50%] translate-y-[-50%]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-[20%] translate-y-[20%]"></div>
        </div>

        <div className="container px-4 md:px-6 z-10 relative">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground font-serif">
                Design Your Dream <span className="text-primary italic">Invitation</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-sans">
                Beautiful, culturally rich printed cards for your most auspicious moments. Choose a design, customize in minutes, and we deliver to your doorstep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
              <Link
                href="/cards"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Start Designing Now
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background border-primary/20 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Cards) */}
      <section className="w-full py-16 md:py-24 bg-card/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground font-serif">
              Celebrate Every Occasion
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full"></div>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed">
              From grand weddings to intimate pujas, we have traditional and modern themes for your event.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { id: "wedding", name: "Wedding", icon: "💍", color: "bg-red-50 text-red-700" },
              { id: "engagement", name: "Engagement", icon: "✨", color: "bg-amber-50 text-amber-700" },
              { id: "birthday", name: "Birthday", icon: "🎂", color: "bg-blue-50 text-blue-700" },
              { id: "puja", name: "Religious Puja", icon: "🪔", color: "bg-orange-50 text-orange-700" },
            ].map((cat) => (
              <Link href={`/cards/${cat.id}`} key={cat.id} className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-full ${cat.color} text-2xl transition-transform group-hover:scale-110 duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="font-serif font-semibold text-lg">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Easy Workflow Section */}
      <section className="w-full py-16 md:py-24 bg-accent text-accent-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-serif">
                Four Steps to Perfection
              </h2>
              <p className="max-w-[600px] md:text-xl/relaxed text-accent-foreground/80">
                We've made ordering high-quality invitations incredibly simple for your entire family.
              </p>

              <ul className="grid gap-6 mt-8">
                {[
                  { title: "Browse Gallery", desc: "Select from hundreds of curated Indian designs." },
                  { title: "Customize Easily", desc: "Type your details in English or Hindi. See real-time changes." },
                  { title: "Review Live Preview", desc: "Check how the printed card will look exactly." },
                  { title: "Fast Delivery", desc: "Quality printing delivered rapidly to your home." },
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-accent-foreground/70 text-sm">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right side placeholder for a beautiful app mockup or illustration */}
            <div className="mx-auto rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-white/10 w-full aspect-[4/3] flex items-center justify-center backdrop-blur-sm">
              <span className="text-accent-foreground/50 italic font-serif text-lg">Live Preview Interface Mockup</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
