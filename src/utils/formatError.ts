export function formatBlockchainError(error: unknown): string {
  let message = "";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "An unknown error occurred";
  }

  // Handle common custom errors from the contract
  if (message.includes("BuyLimitExceeded")) return "You have exceeded the maximum purchase limit.";
  if (message.includes("InsufficientFunds") || message.includes("ERC20: transfer amount exceeds balance")) return "Insufficient token balance.";
  if (message.includes("PresaleNotActive") || message.includes("SaleNotStarted")) return "The presale is not currently active.";
  if (message.includes("User rejected") || message.includes("User rejected the request")) return "Transaction was rejected by the user.";
  
  // Try to use viem's shortMessage if available
  const anyError = error as any;
  if (anyError.shortMessage) {
    return anyError.shortMessage;
  }
  
  // Fallback to the first line if it's a giant viem error string
  return message.split('\n')[0];
}
