import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Zap, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListServices } from "@workspace/api-client-react";
import { ServiceCard } from "@/components/ServiceCard";
import { motion } from "framer-motion";

export default function Home() {
  const { data, isLoading } = useListServices({ limit: 4 });
  const featuredServices = data?.services || [];

  const categories = [
    "Development", "Design", "Marketing", "Writing", "Consulting", "Video"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Background Image injected via CSS or directly */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20 shadow-sm">
                The Premium Service Marketplace
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">freelance services</span> for your business
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Connect with top-tier professionals offering elite services in development, design, marketing, and more. Quality guaranteed.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/services">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                    Explore Services <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white/50 backdrop-blur-sm">
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Vetted Professionals", desc: "Every provider passes a strict quality check." },
              { icon: Zap, title: "Fast Delivery", desc: "Get your projects delivered on time, every time." },
              { icon: Trophy, title: "Premium Quality", desc: "Exceptional results that exceed expectations." },
              { icon: CheckCircle2, title: "Secure Payments", desc: "Your money is safe until you approve the work." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">Popular Categories</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <Link key={cat} href={`/services?category=${cat}`}>
                <div className="px-6 py-4 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-semibold text-slate-700 hover:text-primary cursor-pointer">
                  {cat}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Featured Services</h2>
            <p className="text-muted-foreground text-lg">Top rated services handpicked for you.</p>
          </div>
          <Link href="/services">
            <Button variant="ghost" className="hidden md:flex">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service, i) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/services">
            <Button variant="outline" className="w-full">View All Services</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
