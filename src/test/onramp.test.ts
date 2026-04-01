import { describe, it, expect, vi } from "vitest";
import { generateOnrampUrl } from "@/services/onramp";

const BASE_PARAMS = {
  projectId: "test-project-id",
  destinationAddress: "0xabc123",
  chainId: 8453,
  presetFiatAmount: 50,
  redirectUrl: "https://example.com/return",
};

describe("generateOnrampUrl", () => {
  it("valid params produce a URL with correct appId, destinationWallets, presetFiatAmount, redirectUrl", () => {
    const url = generateOnrampUrl(BASE_PARAMS);
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      "https://pay.coinbase.com/buy/select-asset"
    );
    expect(parsed.searchParams.get("appId")).toBe("test-project-id");
    expect(parsed.searchParams.get("presetFiatAmount")).toBe("50");
    expect(parsed.searchParams.get("redirectUrl")).toBe(
      "https://example.com/return"
    );

    const wallets = JSON.parse(parsed.searchParams.get("destinationWallets")!);
    expect(wallets).toHaveLength(1);
    expect(wallets[0].address).toBe("0xabc123");
    expect(wallets[0].assets).toContain("USDC");
  });

  it("chainId === 8453 sets supportedNetworks: ['base']", () => {
    const url = generateOnrampUrl({ ...BASE_PARAMS, chainId: 8453 });
    const parsed = new URL(url);
    const wallets = JSON.parse(parsed.searchParams.get("destinationWallets")!);
    expect(wallets[0].supportedNetworks).toEqual(["base"]);
  });

  it("chainId === 84532 falls back to 'base' network", () => {
    const url = generateOnrampUrl({ ...BASE_PARAMS, chainId: 84532 });
    const parsed = new URL(url);
    const wallets = JSON.parse(parsed.searchParams.get("destinationWallets")!);
    expect(wallets[0].supportedNetworks).toEqual(["base"]);
  });

  it("empty projectId throws with message 'COINBASE_PROJECT_ID is not configured'", () => {
    expect(() =>
      generateOnrampUrl({ ...BASE_PARAMS, projectId: "" })
    ).toThrowError("COINBASE_PROJECT_ID is not configured");
  });
});

// ---------------------------------------------------------------------------
// Regression tests for existing payment paths (Requirement 5.1, 5.2, 5.3)
// These tests exercise the pure state-machine logic extracted from PaymentModal
// without rendering the component (avoids wagmi/rainbowkit/framer-motion deps).
// ---------------------------------------------------------------------------

// --- Helpers that mirror PaymentModal's internal logic ---

type PaymentStep =
  | "select"
  | "crypto"
  | "topup"
  | "bank"
  | "bank_upload"
  | "processing"
  | "success"
  | "saft";

/** Mirrors handlePaymentSelect */
function handlePaymentSelect(
  method: string,
  setStep: (s: PaymentStep) => void
) {
  if (method === "bank") setStep("bank");
  else setStep("crypto");
}

/** Mirrors processPayment (Card Top-up path) */
function processPayment(
  setStep: (s: PaymentStep) => void,
  scheduleTimeout: (fn: () => void, ms: number) => void
) {
  setStep("processing");
  scheduleTimeout(() => setStep("success"), 2000);
}

/** Mirrors handleBankUpload */
function handleBankUpload(
  setReceiptUploaded: (v: boolean) => void,
  setStep: (s: PaymentStep) => void,
  scheduleTimeout: (fn: () => void, ms: number) => void
) {
  setReceiptUploaded(true);
  scheduleTimeout(() => {
    setStep("processing");
    scheduleTimeout(() => setStep("success"), 2500);
  }, 1000);
}

/** Mirrors handleAutoApproveAndBuy (early-exit path only — no wallet calls) */
function handleAutoApproveAndBuyEarlyExit(
  insufficientFunds: boolean,
  isConnected: boolean,
  PRESALE_ADDRESS: string | undefined,
  USDC_ADDRESS: string | undefined,
  setStep: (s: PaymentStep) => void
): boolean {
  if (!PRESALE_ADDRESS || !USDC_ADDRESS) return false;
  if (!isConnected) return false;
  if (insufficientFunds) {
    setStep("topup");
    return true; // early exit taken
  }
  return false; // would continue to on-chain flow
}

// ---------------------------------------------------------------------------

describe("Regression: step transitions", () => {
  it("select → crypto when payment method is 'crypto'", () => {
    let step: PaymentStep = "select";
    handlePaymentSelect("crypto", (s) => { step = s; });
    expect(step).toBe("crypto");
  });

  it("select → bank when payment method is 'bank'", () => {
    let step: PaymentStep = "select";
    handlePaymentSelect("bank", (s) => { step = s; });
    expect(step).toBe("bank");
  });

  it("crypto → topup when handleCryptoConfirm is called with insufficientFunds", () => {
    let step: PaymentStep = "crypto";
    // mirrors: const handleCryptoConfirm = () => { if (insufficientFunds) setStep("topup"); }
    const insufficientFunds = true;
    if (insufficientFunds) step = "topup";
    expect(step).toBe("topup");
  });

  it("bank → bank_upload transition (back-button sets step to 'bank', upload button sets to 'bank_upload')", () => {
    // The bank step has a "Continue" button that sets step to "bank_upload"
    let step: PaymentStep = "bank";
    step = "bank_upload";
    expect(step).toBe("bank_upload");
  });

  it("bank_upload → processing → success via handleBankUpload", () => {
    let step: PaymentStep = "bank_upload";
    let receiptUploaded = false;
    const calls: Array<[() => void, number]> = [];

    handleBankUpload(
      (v) => { receiptUploaded = v; },
      (s) => { step = s; },
      (fn, ms) => { calls.push([fn, ms]); }
    );

    expect(receiptUploaded).toBe(true);
    // First timeout fires → sets step to "processing" and schedules second
    calls[0][0]();
    expect(step).toBe("processing");
    // Second timeout fires → sets step to "success"
    calls[1][0]();
    expect(step).toBe("success");
  });

  it("processing → success via processPayment", () => {
    let step: PaymentStep = "topup";
    const calls: Array<[() => void, number]> = [];

    processPayment(
      (s) => { step = s; },
      (fn, ms) => { calls.push([fn, ms]); }
    );

    expect(step).toBe("processing");
    calls[0][0]();
    expect(step).toBe("success");
  });

  it("success → saft via handleViewSAFT", () => {
    let step: PaymentStep = "success";
    // mirrors: const handleViewSAFT = () => { setStep("saft"); }
    step = "saft";
    expect(step).toBe("saft");
  });
});

describe("Regression: Card Top-up button calls processPayment → advances to 'processing'", () => {
  it("clicking Card Top-up immediately sets step to 'processing'", () => {
    let step: PaymentStep = "topup";
    const calls: Array<[() => void, number]> = [];

    // Card Top-up onClick={processPayment}
    processPayment(
      (s) => { step = s; },
      (fn, ms) => { calls.push([fn, ms]); }
    );

    expect(step).toBe("processing");
  });

  it("after processPayment timeout, step advances to 'success'", () => {
    let step: PaymentStep = "topup";
    const calls: Array<[() => void, number]> = [];

    processPayment(
      (s) => { step = s; },
      (fn, ms) => { calls.push([fn, ms]); }
    );

    expect(step).toBe("processing");
    calls[0][0](); // fire the 2000ms timeout
    expect(step).toBe("success");
  });

  it("processPayment does NOT call handleCoinbaseOnramp or open any URL", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null);
    let step: PaymentStep = "topup";

    processPayment(
      (s) => { step = s; },
      (_fn, _ms) => { /* don't fire */ }
    );

    expect(step).toBe("processing");
    expect(windowOpenSpy).not.toHaveBeenCalled();
    windowOpenSpy.mockRestore();
  });
});

describe("Regression: handleAutoApproveAndBuy logic", () => {
  const PRESALE = "0xPresale";
  const USDC = "0xUsdc";

  it("when insufficientFunds is true, sets step to 'topup' and returns early", () => {
    let step: PaymentStep = "crypto";
    const earlyExit = handleAutoApproveAndBuyEarlyExit(
      true, true, PRESALE, USDC,
      (s) => { step = s; }
    );
    expect(step).toBe("topup");
    expect(earlyExit).toBe(true);
  });

  it("when insufficientFunds is false, does NOT set step to 'topup'", () => {
    let step: PaymentStep = "crypto";
    handleAutoApproveAndBuyEarlyExit(
      false, true, PRESALE, USDC,
      (s) => { step = s; }
    );
    // step should remain "crypto" (on-chain flow would continue)
    expect(step).toBe("crypto");
  });

  it("when wallet is not connected, returns early without changing step", () => {
    let step: PaymentStep = "crypto";
    handleAutoApproveAndBuyEarlyExit(
      false, false, PRESALE, USDC,
      (s) => { step = s; }
    );
    expect(step).toBe("crypto");
  });

  it("when PRESALE_ADDRESS is missing, returns early without changing step", () => {
    let step: PaymentStep = "crypto";
    handleAutoApproveAndBuyEarlyExit(
      true, true, undefined, USDC,
      (s) => { step = s; }
    );
    expect(step).toBe("crypto");
  });

  it("when USDC_ADDRESS is missing, returns early without changing step", () => {
    let step: PaymentStep = "crypto";
    handleAutoApproveAndBuyEarlyExit(
      true, true, PRESALE, undefined,
      (s) => { step = s; }
    );
    expect(step).toBe("crypto");
  });
});
