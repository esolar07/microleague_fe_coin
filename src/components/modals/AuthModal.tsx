import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSignMessage, useSwitchChain } from "wagmi";
import { type BackendWalletTypeName } from "@/lib/backend-auth";
import { useAuth } from "@/hooks/use-auth";
import { authenticateWallet } from "@/services/auth";
import { APP_CHAIN } from "@/config/network";
import { requestSwitchChain } from "@/web3/requestSwitchChain";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep =
  | "choose"
  | "email"
  | "wallet-select"
  | "verify"
  | "otp"
  | "success";

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const { login } = useAuth();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false);

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

  const walletType = useMemo<BackendWalletTypeName>(() => {
    const connectorName = connector?.name?.toLowerCase() ?? "";
    const connectorId = connector?.id?.toLowerCase() ?? "";

    if (
      connectorName.includes("coinbase") ||
      connectorId.includes("coinbase")
    ) {
      return "smart";
    }
    if (
      connectorName.includes("walletconnect") ||
      connectorId.includes("walletconnect")
    ) {
      return "base";
    }
    return "extension";
  }, [connector?.id, connector?.name]);

  const buildSignInMessage = (walletAddress: string, timestampMs: number) => {
    const issuedAtIso = new Date(timestampMs).toISOString();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "microleague";

    return [
      "MicroLeague wants you to sign in with your Ethereum account:",
      walletAddress,
      "",
      `URI: ${origin}`,
      "Version: 1",
      `Chain ID: ${chainId}`,
      `Nonce: ${timestampMs}`,
      `Issued At: ${issuedAtIso}`,
    ].join("\n");
  };

  const ensureCorrectChain = async () => {
    if (!isConnected) throw new Error("Wallet not connected");
    if (chainId === APP_CHAIN.id) return;
    const connectorId = connector?.id?.toLowerCase() ?? "";
    if (connectorId.includes("injected") || connectorId.includes("meta")) {
      try {
        await requestSwitchChain(APP_CHAIN);
        return;
      } catch {
        // fall back to wagmi switch prompt
      }
    }

    await switchChainAsync({ chainId: APP_CHAIN.id });
  };

  const handleWalletSignIn = async () => {
    if (!address) return;
    try {
      setAuthError(null);
      setStep("verify");

      await ensureCorrectChain();

      const timestamp = Date.now();
      const message = buildSignInMessage(address, timestamp);
      const signature = await signMessageAsync({ account: address, message });

      const result = await authenticateWallet({
        walletAddress: address,
        signature,
        message,
        timestamp,
        walletType,
      });

      login({ token: result.token, user: result.user });
      setStep("success");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in failed");
      setStep("wallet-select");
    }
  };

  const handleClose = () => {
    setStep("choose");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setAuthError(null);
    setAutoSwitchAttempted(false);
    onClose();
  };

  const handleSuccess = () => {
    setStep("choose");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setAuthError(null);
    setAutoSwitchAttempted(false);
    onSuccess();
  };

  useEffect(() => {
    if (!isConnected) return;
    if (step !== "wallet-select") return;
    if (chainId === APP_CHAIN.id) return;
    if (autoSwitchAttempted) return;
    if (isSwitchingChain) return;

    setAutoSwitchAttempted(true);
    (async () => {
      try {
        await switchChainAsync({ chainId: APP_CHAIN.id });
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : "Failed to switch network",
        );
      }
    })();
  }, [
    autoSwitchAttempted,
    chainId,
    isConnected,
    isSwitchingChain,
    step,
    switchChainAsync,
  ]);

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
                        {isLogin
                          ? "Sign in to continue"
                          : "Join MicroLeague today"}
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setStep("email")}
                      disabled
                      className="w-full p-4 rounded-xl border border-border bg-secondary/30 transition-all text-left opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              Continue with Email
                            </span>
                            <span className="mlc-badge text-[10px]">
                              Coming soon
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            No backend support yet
                          </p>
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
                          <span className="font-medium text-foreground">
                            Connect Wallet
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Coinbase, MetaMask, Trust & more
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Security Notice
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Never share your private keys, seed phrases, or wallet
                        passwords with anyone.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Wallet Selection */}
              {step === "wallet-select" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">
                        Connect Wallet
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Choose your wallet
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-foreground">
                      {authError}
                    </div>
                  )}

                  {!isConnected ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => openConnectModal?.()}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              Connect wallet
                            </span>
                            <span className="mlc-badge text-[10px]">
                              RainbowKit
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            MetaMask, Coinbase, WalletConnect
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <p className="text-sm text-muted-foreground">
                          Connected wallet
                        </p>
                        <p className="font-medium text-foreground break-all">
                          {address}
                        </p>
                      </div>

                      {chainId !== APP_CHAIN.id && (
                        <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                          <p className="text-sm font-medium text-foreground">
                            Switch to {APP_CHAIN.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Please switch your wallet network to continue.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={async () => {
                              try {
                                setAuthError(null);
                                await switchChainAsync({
                                  chainId: APP_CHAIN.id,
                                });
                              } catch (error) {
                                setAuthError(
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to switch network",
                                );
                              }
                            }}
                            disabled={isSwitchingChain}
                            className="mt-3 w-full mlc-btn-primary disabled:opacity-60"
                          >
                            {isSwitchingChain
                              ? "Switching..."
                              : `Switch to ${APP_CHAIN.name}`}
                          </motion.button>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleWalletSignIn}
                        disabled={chainId !== APP_CHAIN.id}
                        className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                      >
                        Sign message to continue
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>

                      <p className="text-xs text-muted-foreground text-center">
                        This signs a message (no gas fees). It does not create a
                        transaction.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Email Form */}
              {step === "email" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">
                        Enter Your Email
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        We'll send you a verification code
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Email Address
                      </label>
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
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy.
                  </p>
                </>
              )}

              {/* OTP Verification */}
              {step === "otp" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">
                        Verify Email
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Enter the code sent to {email}
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                    >
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
                    Signing you in
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please confirm the signature request in your wallet...
                  </p>
                </div>
              )}

              {/* Success */}
              {step === "success" && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    You're All Set!
                  </h2>
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
