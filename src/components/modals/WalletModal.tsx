import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Mail, Shield } from "lucide-react";
import { SignInModal } from "@coinbase/cdp-react/components/SignInModal";
import { useIsSignedIn, useEvmAccounts } from "@coinbase/cdp-hooks";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (method: "coinbase" | "rainbowkit") => void;
  onEmailAlreadySignedIn?: (address: string) => void;
}

const WalletModal = ({
  isOpen,
  onClose,
  onSelectWallet,
  onEmailAlreadySignedIn,
}: WalletModalProps) => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAccounts } = useEvmAccounts();
  const coinbaseEvmAddress = evmAccounts?.[0]?.address ?? null;

  const emailButtonContent = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
        <Mail className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Email</span>
          <span className="mlc-badge-primary text-[10px]">Recommended</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in with email via Coinbase
        </p>
      </div>
    </div>
  );

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
            className="fixed inset-0 bg-foreground/20 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="mlc-card-elevated w-full max-w-md bd">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Connect Wallet
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Choose how to connect
                    </p>
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
                {/* Email via Coinbase CDP */}
                {isSignedIn && coinbaseEvmAddress ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onEmailAlreadySignedIn?.(coinbaseEvmAddress);
                      onClose();
                    }}
                    className="w-full p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                  >
                    {emailButtonContent}
                  </motion.button>
                ) : (
                  <SignInModal>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                    >
                      {emailButtonContent}
                    </motion.button>
                  </SignInModal>
                )}

                {/* Coinbase Wallet */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    onSelectWallet("coinbase");
                    onClose();
                  }}
                  className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔵</span>
                    <div>
                      <span className="font-medium text-foreground">
                        Coinbase Wallet
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Connect with Coinbase Wallet app
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Other Wallets via RainbowKit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    onSelectWallet("rainbowkit");
                    onClose();
                  }}
                  className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌈</span>
                    <div>
                      <span className="font-medium text-foreground">
                        Other Wallets
                      </span>
                      <p className="text-sm text-muted-foreground">
                        MetaMask, WalletConnect & more
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Secure Connection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your wallet connection is encrypted and secure. We never
                    have access to your private keys.
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
