import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import WhyMlcSection from "@/components/sections/WhyMlcSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TokenGrowthSection from "@/components/sections/TokenGrowthSection";
import RewardsSection from "@/components/sections/RewardsSection";
import TokenomicsSection from "@/components/sections/TokenomicsSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import LaunchpadSection from "@/components/sections/LaunchpadSection";
import InfrastructureSection from "@/components/sections/InfrastructureSection";
import SustainabilitySection from "@/components/sections/SustainabilitySection";
import PresaleWidget from "@/components/presale/PresaleWidget";
import WalletModal from "@/components/modals/WalletModal";
import PaymentModal from "@/components/modals/PaymentModal";
import AuthModal from "@/components/modals/AuthModal";
import ReferralModal from "@/components/modals/ReferralModal";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PresalePage = () => {
  const [showPresaleWidget, setShowPresaleWidget] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const { isAuthenticated } = useAuth();

  const handleBuyClick = () => {
    setShowPresaleWidget(true);
  };

  const handleWidgetBuy = (amount: number) => {
    console.log("💰 Purchase amount from widget:", amount);
    setPurchaseAmount(amount);
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowReferralModal(true);
  };

  const handleWalletSelect = (method: string) => {
    setShowWalletModal(false);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16">
        <HeroSection onBuyClick={handleBuyClick} />
        <WhyMlcSection />
        <HowItWorksSection />
        <TokenGrowthSection onBuyClick={handleBuyClick} />
        <RewardsSection />
        <div id="tokenomics">
          <TokenomicsSection />
        </div>
        <SustainabilitySection />
        <div id="roadmap">
          <RoadmapSection />
        </div>
        <LaunchpadSection />
        <InfrastructureSection />
      </main>

      <Footer />

      {/* Floating Presale Widget */}
      <AnimatePresence>
        {showPresaleWidget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPresaleWidget(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 100, x: "-50%" }}
              className="fixed bottom-4 left-1/2 z-50"
            >
              <div className="relative">
                <button
                  onClick={() => setShowPresaleWidget(false)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <PresaleWidget onBuyClick={handleWidgetBuy} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleWalletSelect}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={purchaseAmount}
        mlcAmount={purchaseAmount / 0.001}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </div>
  );
};

export default PresalePage;
