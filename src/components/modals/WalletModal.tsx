import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Mail, ExternalLink, Shield } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (method: string) => void;
}

const walletOptions = [
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with Coinbase Wallet",
    icon: "🔵",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan with your mobile wallet",
    icon: "🔗",
    popular: false,
  },
  {
    id: "email",
    name: "Email Smart Wallet",
    description: "No seed phrases, just your email",
    icon: "✉️",
    popular: true,
    recommended: true,
  },
];

const WalletModal = ({ isOpen, onClose, onSelectWallet }: WalletModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="mlc-card-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Connect Wallet</h2>
                    <p className="text-sm text-muted-foreground">Choose how to connect</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Wallet Options */}
              <div className="space-y-3">
                {walletOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectWallet(option.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                      option.recommended
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-card hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{option.name}</span>
                            {option.recommended && (
                              <span className="mlc-badge-primary text-[10px]">Recommended</span>
                            )}
                            {option.popular && !option.recommended && (
                              <span className="mlc-badge text-[10px]">Popular</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Secure Connection</p>
                  <p className="text-xs text-muted-foreground">
                    Your wallet connection is encrypted and secure. We never have access to your private keys.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletModal;
