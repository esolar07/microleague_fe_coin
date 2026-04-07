export function formatBlockchainError(error: unknown): string {
  let message = "";
  const anyError = error as any;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "An unknown error occurred";
  }

  // Try to extract CDP errorMessage from nested error objects or JSON in message
  if (anyError?.cause?.message) {
    const causeMsg: string = anyError.cause.message;
    if (causeMsg.includes("Insufficient balance")) return "Insufficient balance in your Coinbase wallet. Please top up your USDC balance and try again.";
  }

  // Try to parse JSON embedded in the error message (CDP errors sometimes embed JSON)
  try {
    const jsonMatch = message.match(/\{.*"errorMessage".*\}/s);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.errorMessage) {
        if (parsed.errorMessage.includes("Insufficient balance")) {
          return "Insufficient balance in your Coinbase wallet. Please top up your USDC balance and try again.";
        }
        return parsed.errorMessage;
      }
    }
  } catch { /* ignore parse errors */ }

  // Coinbase CDP / embedded wallet errors
  if (message.includes("Insufficient balance") || message.includes("insufficient balance")) return "Insufficient balance in your Coinbase wallet. Please top up your USDC balance and try again.";
  if (message.includes("Transaction creation failed")) return "Transaction creation failed. Please check your USDC balance and try again.";

  // Handle common custom errors from the contract
  if (message.includes("BuyLimitExceeded")) return "You have exceeded the maximum purchase limit.";
  if (message.includes("InsufficientFunds") || message.includes("ERC20: transfer amount exceeds balance")) return "Insufficient token balance.";
  if (message.includes("PresaleNotActive") || message.includes("SaleNotStarted")) return "The presale is not currently active.";
  if (message.includes("User rejected") || message.includes("User rejected the request")) return "Transaction was rejected by the user.";
  if (message.includes("could not be found") || message.includes("receipt with hash")) return "Transaction is still being confirmed. Please wait a moment and check your dashboard — your tokens may have already been allocated.";
  if (message.includes("timed out") || message.includes("timeout")) return "Transaction confirmation timed out. The transaction may still succeed — please check your dashboard shortly.";

  // Try to use viem's shortMessage if available
  if (anyError.shortMessage) {
    return anyError.shortMessage;
  }

  // Fallback to the first line
  return message.split('\n')[0];
}
