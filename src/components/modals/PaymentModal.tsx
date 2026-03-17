import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Coins, ArrowLeft, CheckCircle, AlertCircle,
  Loader2, Building2, Upload, FileText, Mail, Shield, Clock,
  Download, Copy
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  mlcAmount: number;
}

type PaymentStep = "select" | "card" | "crypto" | "topup" | "bank" | "bank_upload" | "processing" | "success" | "saft";

const bankDetails = {
  bankName: "First National Bank",
  accountName: "MicroLeague Technologies Ltd",
  accountNumber: "1234567890",
  routingNumber: "021000021",
  swiftCode: "FNBKUS33",
  reference: "MLC-PRESALE-",
};

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, mlcAmount }: PaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>("select");
  const [cryptoBalance] = useState(25.50);
  const insufficientFunds = amount > cryptoBalance;
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const txRef = `MLC-${Date.now().toString(36).toUpperCase()}`;

  const handlePaymentSelect = (method: string) => {
    if (method === "card") setStep("card");
    else if (method === "bank") setStep("bank");
    else setStep("crypto");
  };

  const handleCryptoConfirm = () => {
    if (insufficientFunds) setStep("topup");
    else processPayment();
  };

  const processPayment = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2000);
  };

  const handleBankUpload = () => {
    setReceiptUploaded(true);
    setTimeout(() => {
      setStep("processing");
      setTimeout(() => setStep("success"), 2500);
    }, 1000);
  };

  const handleClose = () => {
    setStep("select");
    setReceiptUploaded(false);
    setEmailSent(false);
    onClose();
  };

  const handleSuccessClose = () => {
    setStep("select");
    setReceiptUploaded(false);
    setEmailSent(false);
    onSuccess();
  };

  const handleViewSAFT = () => {
    setStep("saft");
  };

  const handleSendSAFT = () => {
    setEmailSent(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="mlc-card-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Payment Selection */}
              {step === "select" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
                      <p className="text-sm text-muted-foreground">Select how you'd like to pay</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-xl font-bold text-foreground">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">You'll receive</span>
                      <span className="text-sm font-medium text-primary">{mlcAmount.toLocaleString()} MLC</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePaymentSelect("card")}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Credit / Debit Card</span>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, AMEX</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePaymentSelect("crypto")}
                      className="w-full p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl mlc-gradient-bg flex items-center justify-center">
                          <Coins className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">USDC on Base</span>
                            <span className="mlc-badge-primary text-[10px]">Lowest Fees</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Pay with crypto</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePaymentSelect("bank")}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Bank / Wire Transfer</span>
                          <p className="text-sm text-muted-foreground">Manual transfer with receipt upload</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </>
              )}

              {/* Card Payment */}
              {step === "card" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("select")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Card Details</h2>
                      <p className="text-sm text-muted-foreground">Enter your payment info</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="mlc-input mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="mlc-input mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">CVC</label>
                        <input type="text" placeholder="123" className="mlc-input mt-1" />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processPayment}
                    className="w-full mlc-btn-primary mt-6"
                  >
                    Pay ${amount.toFixed(2)}
                  </motion.button>
                </>
              )}

              {/* Crypto Payment */}
              {step === "crypto" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("select")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">USDC Payment</h2>
                      <p className="text-sm text-muted-foreground">Pay with USDC on Base</p>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Your Balance</span>
                      <span className="text-lg font-semibold text-foreground">{cryptoBalance.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Required</span>
                      <span className={`text-lg font-semibold ${insufficientFunds ? "text-destructive" : "text-success"}`}>
                        {amount.toFixed(2)} USDC
                      </span>
                    </div>
                  </div>

                  {insufficientFunds && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Insufficient Balance</p>
                        <p className="text-xs text-muted-foreground">You need {(amount - cryptoBalance).toFixed(2)} more USDC</p>
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCryptoConfirm}
                    className={`w-full ${insufficientFunds ? "mlc-btn-secondary" : "mlc-btn-primary"}`}
                  >
                    {insufficientFunds ? "Top Up Balance" : `Pay ${amount.toFixed(2)} USDC`}
                  </motion.button>
                </>
              )}

              {/* Top Up */}
              {step === "topup" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("crypto")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Top Up USDC</h2>
                      <p className="text-sm text-muted-foreground">Add funds to continue</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={processPayment}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Card Top-up</span>
                          <p className="text-sm text-muted-foreground">Add ${(amount - cryptoBalance + 5).toFixed(2)} via card</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={processPayment}
                      className="w-full p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔵</span>
                        <div>
                          <span className="font-medium text-foreground">Coinbase Onramp</span>
                          <p className="text-sm text-muted-foreground">Fast, low fees</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </>
              )}

              {/* Bank Transfer */}
              {step === "bank" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("select")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Bank Wire Transfer</h2>
                      <p className="text-sm text-muted-foreground">Send via wire and upload receipt</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-4">
                    <p className="text-sm text-warning flex items-start gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Wire transfers are manually verified and may take 1-3 business days. Tokens will be allocated after confirmation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50 space-y-3 mb-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Transfer Details</p>
                    {[
                      { label: "Bank Name", value: bankDetails.bankName },
                      { label: "Account Name", value: bankDetails.accountName },
                      { label: "Account Number", value: bankDetails.accountNumber },
                      { label: "Routing Number", value: bankDetails.routingNumber },
                      { label: "SWIFT Code", value: bankDetails.swiftCode },
                      { label: "Reference", value: `${bankDetails.reference}${txRef}` },
                      { label: "Amount", value: `$${amount.toFixed(2)} USD` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground font-mono">{item.value}</span>
                          <button
                            onClick={() => copyToClipboard(item.value, item.label)}
                            className="p-1 rounded hover:bg-secondary"
                          >
                            {copied === item.label ? (
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("bank_upload")}
                    className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                  >
                    I've Made the Transfer
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </motion.button>
                </>
              )}

              {/* Bank Upload Receipt */}
              {step === "bank_upload" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("bank")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Upload Receipt</h2>
                      <p className="text-sm text-muted-foreground">Upload proof of your transfer</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div
                      onClick={handleBankUpload}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        receiptUploaded
                          ? "border-success bg-success/5"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {receiptUploaded ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                          <p className="font-medium text-foreground">Receipt Uploaded</p>
                          <p className="text-sm text-muted-foreground mt-1">bank_receipt.pdf</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <p className="font-medium text-foreground">Click to upload receipt</p>
                          <p className="text-sm text-muted-foreground mt-1">PDF, PNG, or JPG (max 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/50 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono text-foreground">{bankDetails.reference}{txRef}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-foreground">${amount.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {!receiptUploaded && (
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      Upload your transfer receipt for faster processing
                    </p>
                  )}
                </>
              )}

              {/* Processing */}
              {step === "processing" && (
                <div className="py-8 text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground">Processing Payment</h2>
                  <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your transaction...</p>
                </div>
              )}

              {/* Success */}
              {step === "success" && (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-success" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground">Purchase Successful!</h2>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    You've purchased <span className="font-semibold text-primary">{mlcAmount.toLocaleString()} MLC</span>
                  </p>

                  {/* SAFT & Vesting Info */}
                  <div className="text-left space-y-3 mb-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">SAFT Certificate Generated</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your Simple Agreement for Future Tokens is ready. This document confirms your token allocation and vesting terms.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                      <p className="text-xs font-semibold text-foreground mb-2">Vesting Schedule</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Cliff Period</span>
                        <span className="text-foreground">3 months</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Vesting Duration</span>
                        <span className="text-foreground">12 months (quarterly)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">First Unlock</span>
                        <span className="text-foreground">25% after cliff</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Auto-Stake</span>
                        <span className="text-success">12.5% APY available</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                      <p className="text-xs text-warning flex items-start gap-2">
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Your tokens are secured in audited smart contracts and will vest per the schedule above.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleViewSAFT}
                      className="w-full mlc-btn-primary flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View SAFT Certificate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSuccessClose}
                      className="w-full mlc-btn-secondary"
                    >
                      Go to Dashboard
                    </motion.button>
                  </div>
                </div>
              )}

              {/* SAFT Certificate View */}
              {step === "saft" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep("success")} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">SAFT Certificate</h2>
                      <p className="text-sm text-muted-foreground">Simple Agreement for Future Tokens</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent mb-4">
                    <div className="text-center mb-4 pb-4 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Certificate of Purchase</p>
                      <h3 className="text-lg font-bold text-foreground mt-1">MicroLeague Coin (MLC)</h3>
                      <p className="text-xs text-muted-foreground mt-1">Ref: {txRef}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchaser</span>
                        <span className="font-medium text-foreground">user@example.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium text-foreground">${amount.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens Allocated</span>
                        <span className="font-bold text-primary">{mlcAmount.toLocaleString()} MLC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per Token</span>
                        <span className="font-medium text-foreground">$0.01</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vesting</span>
                        <span className="font-medium text-foreground">12mo, quarterly, 3mo cliff</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">
                        This SAFT certificate confirms your token allocation under the MicroLeague Presale Phase 1 terms.
                        Tokens vest quarterly over 12 months with a 3-month cliff period.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendSAFT}
                      disabled={emailSent}
                      className={`w-full flex items-center justify-center gap-2 ${
                        emailSent ? "mlc-btn-secondary opacity-80" : "mlc-btn-primary"
                      }`}
                    >
                      {emailSent ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          SAFT Sent to Email
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Email SAFT Certificate
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSuccessClose}
                      className="w-full mlc-btn-secondary flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF & Close
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
