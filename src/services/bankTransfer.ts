// bankTransfer.ts - Bank Transfer Service
import { API_BASE_URL } from "@/lib/api";

export interface BankTransferSubmission {
  walletAddress: string;
  amount: number;
  senderName: string;
  bankName: string;
  transactionRef: string;
  paymentRef: string;
  proofFile: File;
  notes?: string;
}

export interface BankTransferResult {
  transferId: string;
  status: string;
  message: string;
}

export interface BankTransferRecord {
  id: string;
  transferId: string;
  walletAddress: string;
  amount: number;
  senderName: string;
  bankName: string;
  transactionRef: string;
  paymentRef: string;
  submittedDate: string;
  status: "Pending" | "Verified" | "Rejected";
  proofUrl: string;
  notes: string;
  verificationNote?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export async function getBankTransfers(
  walletAddress: string,
): Promise<BankTransferRecord[]> {
  const response = await fetch(
    `${API_BASE_URL}/bank-transfers?walletAddress=${encodeURIComponent(walletAddress)}&limit=50`,
  );
  if (!response.ok) return [];
  const result = (await response.json()) as any;
  const items = result.data?.data ?? result;
  return Array.isArray(items) ? items : [];
}

export async function submitBankTransfer(
  data: BankTransferSubmission,
): Promise<BankTransferResult> {
  // Step 1: Upload proof to Cloudinary via main backend
  const proofUrl = "";
  // const proofUrl = await uploadProofFile(data.proofFile, data.walletAddress);

  // Step 2: Submit bank transfer via main backend proxy
  const response = await fetch(`${API_BASE_URL}/bank-transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress: data.walletAddress,
      amount: data.amount,
      senderName: data.senderName,
      bankName: data.bankName,
      transactionRef: data.transactionRef,
      paymentRef: data.paymentRef,
      submittedDate: new Date().toISOString(),
      proofUrl,
      notes: data.notes || "",
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as any).message ||
        `Failed to submit bank transfer: ${response.statusText}`,
    );
  }

  const result = (await response.json()) as any;
  return {
    transferId:
      result.data?.transferId ||
      result.transferId ||
      result.data?.data?.transferId,
    status: result.data?.status || result.status || "Pending",
    message: result.message || "Bank transfer submitted successfully",
  };
}

async function uploadProofFile(
  file: File,
  walletAddress: string,
): Promise<string> {
  // Convert file to base64 for JSON upload
  const fileBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/png;base64,")
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${API_BASE_URL}/bank-transfers/upload-proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress,
      fileName: file.name,
      mimeType: file.type,
      fileBase64,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to upload proof file");
  }

  const result = (await response.json()) as any;
  return result.url;
}
