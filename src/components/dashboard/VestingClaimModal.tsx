// Feature: dashboard-tokens-vesting
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X, AlertTriangle } from "lucide-react";

interface VestingClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimableAmount: number;
  onConfirm: () => void;
  step: "confirm" | "processing" | "done";
  errorMessage?: string;
}

export default function VestingClaimModal({
  isOpen,
  onClose,
  claimableAmount,
  onConfirm,
  step,
  errorMessage,
}: VestingClaimModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={step !== "processing" ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="mlc-card-elevated w-full max-w-sm p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {step === "done" ? "Claim Successful" : "Claim Tokens"}
                </h2>
                {step !== "processing" && (
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Error notification */}
              {errorMessage && step === "confirm" && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Confirm step */}
              {step === "confirm" && (
                <>
                  <p className="text-muted-foreground text-sm">
                    You are about to claim{" "}
                    <span className="font-semibold text-foreground">
                      {claimableAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} MLC
                    </span>{" "}
                    from your vesting schedule.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="mlc-btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onConfirm}
                      className="mlc-btn-primary flex-1"
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )}

              {/* Processing step */}
              {step === "processing" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm">Processing your claim...</p>
                </div>
              )}

              {/* Done step */}
              {step === "done" && (
                <>
                  <div className="flex flex-col items-center gap-3 py-2">
                    <CheckCircle className="w-12 h-12 text-success" />
                    <p className="text-muted-foreground text-sm text-center">
                      Successfully claimed{" "}
                      <span className="font-semibold text-foreground">
                        {claimableAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} MLC
                      </span>
                    </p>
                  </div>
                  <button onClick={onClose} className="mlc-btn-primary w-full">
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
