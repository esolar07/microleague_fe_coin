import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, ArrowLeft, Wallet, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = "choose" | "email" | "wallet-select" | "verify" | "otp" | "success";

const walletOptions = [
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with Coinbase Wallet",
    icon: "🔵",
    popular: true,
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with MetaMask",
    icon: "🦊",
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
    id: "trust",
    name: "Trust Wallet",
    description: "Connect with Trust Wallet",
    icon: "🛡️",
    popular: false,
  },
];

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleEmailSubmit = () => {
    if (email && email.includes("@")) {
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpSubmit = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setStep("verify");
      setTimeout(() => {
        setStep("success");
      }, 2000);
    }
  };

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setStep("verify");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    setStep("choose");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setSelectedWallet(null);
    onClose();
  };

  const handleSuccess = () => {
    setStep("choose");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setSelectedWallet(null);
    onSuccess();
  };

  const handleBack = () => {
    if (step === "email" || step === "wallet-select") {
      setStep("choose");
    } else if (step === "otp") {
      setStep("email");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="mlc-card-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Choose Method */}
              {step === "choose" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {isLogin ? "Welcome Back" : "Create Account"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isLogin ? "Sign in to continue" : "Join MicroLeague today"}
                      </p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setStep("email")}
                      className="w-full p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Continue with Email</span>
                            <span className="mlc-badge-primary text-[10px]">Recommended</span>
                          </div>
                          <p className="text-sm text-muted-foreground">No wallet needed</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setStep("wallet-select")}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Connect Wallet</span>
                          <p className="text-sm text-muted-foreground">Coinbase, MetaMask, Trust & more</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Security Notice</p>
                      <p className="text-xs text-muted-foreground">
                        Never share your private keys, seed phrases, or wallet passwords with anyone.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Wallet Selection */}
              {step === "wallet-select" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">Connect Wallet</h2>
                      <p className="text-sm text-muted-foreground">Choose your wallet</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {walletOptions.map((wallet) => (
                      <motion.button
                        key={wallet.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleWalletSelect(wallet.id)}
                        className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{wallet.name}</span>
                              {wallet.popular && (
                                <span className="mlc-badge text-[10px]">Popular</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {/* Email Form */}
              {step === "email" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">Enter Your Email</h2>
                      <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mlc-input mt-2"
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEmailSubmit}
                    disabled={!email || !email.includes("@")}
                    className="w-full mlc-btn-primary mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Send Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </>
              )}

              {/* OTP Verification */}
              {step === "otp" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">Verify Email</h2>
                      <p className="text-sm text-muted-foreground">Enter the code sent to {email}</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-12 h-12 rounded-xl border border-border bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOtpSubmit}
                    disabled={otp.join("").length !== 6}
                    className="w-full mlc-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Verify & Continue
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-4">
                    Didn't receive the code? Resend
                  </button>
                </>
              )}

              {/* Verify/Loading */}
              {step === "verify" && (
                <div className="py-8 text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedWallet ? "Connecting Wallet" : "Creating Your Wallet"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedWallet 
                      ? "Please confirm the connection in your wallet..."
                      : "Setting up your secure smart wallet..."}
                  </p>
                </div>
              )}

              {/* Success */}
              {step === "success" && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">You're All Set!</h2>
                  <p className="text-sm text-muted-foreground mt-2 mb-6">
                    Your account has been created successfully.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSuccess}
                    className="w-full mlc-btn-primary"
                  >
                    Continue
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
