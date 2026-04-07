import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe, Coins } from "lucide-react";
import { useRef } from "react";
import logo from "@/assets/logo.webp";

interface HeroSectionProps {
  onBuyClick: () => void;
}

const HeroSection = ({ onBuyClick }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const bgOrb1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgOrb2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgOrb1X = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const bgOrb2X = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const statsY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30"
    >
      {/* Background Elements with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y: bgOrb1Y, x: bgOrb1X }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" 
        />
        <motion.div 
          style={{ y: bgOrb2Y, x: bgOrb2X }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.05, 0.1]
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" 
        />
        
        {/* Additional parallax orbs */}
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 250]) }}
          className="absolute top-10 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          className="absolute bottom-10 left-1/3 w-48 h-48 bg-primary/8 rounded-full blur-3xl"
        />
        
        {/* Floating particles with parallax */}
        <motion.div style={{ y: particlesY }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <motion.div 
        style={{ y: textY }}
        className="relative z-10 mlc-container text-center px-4 py-20"
      >
        {/* Animated Logo with Parallax */}
        <motion.div
          style={{ y: logoY, scale: logoScale, opacity: logoOpacity }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Number.POSITIVE_INFINITY, 
              ease: "easeInOut" 
            }}
            className="relative inline-block"
          >
            {/* Glow effect behind logo */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 blur-2xl bg-primary/20 rounded-full"
              style={{ transform: "scale(1.2)" }}
            />
            <img 
              src={logo} 
              alt="MicroLeague Sports" 
              className="relative h-24 md:h-32 lg:h-40 w-auto mx-auto drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.span 
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 10px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            Presale Now Live | Phase 1
          </motion.span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight mb-6"
        >
          The Token Powering{" "}
          <motion.span 
            className="mlc-gradient-text inline-block"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Sports Simulations
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          MicroLeague Coin (MLC) is how you play, earn, and have a say in the 
          world of fantasy sports. Get in early while the price is lowest.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onBuyClick}
            className="mlc-btn-primary text-lg px-8 py-4 flex items-center gap-2"
          >
            Buy MLC Tokens
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mlc-btn-secondary text-lg px-8 py-4"
          >
            Read Whitepaper
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
        >
          {[
            { icon: Shield, text: "Secure & Audited" },
            { icon: Globe, text: "Built on Base" },
            { icon: Coins, text: "No Hidden Fees" },
          ].map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05, color: "var(--primary)" }}
              className="flex items-center gap-2 cursor-default"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats with subtle parallax */}
        <motion.div
          style={{ y: statsY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
        >
          {[
            { label: "Presale Price", value: "$0.01" },
            { label: "Tokens Sold", value: "2,200" },
            { label: "Total Cap", value: "200M" },
            { label: "Blockchain", value: "Base" },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.p 
                className="text-2xl md:text-3xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
