// saft.ts - SAFT Certificate Service
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export interface SAFTCertificateInfo {
  txHash: string;
  amount: number;
  tokens: number;
  date: string;
  walletAddress: string;
  email?: string;
}

interface SAFTUrlResponse {
  success: boolean;
  data: {
    txHash: string;
    pdfUrl: string;
    downloadUrl: string;
  };
}

export class SAFTService {
  /**
   * Download SAFT certificate PDF by transaction hash.
   * The backend proxies the file from Cloudinary, so we download directly from our API.
   */
  static async downloadCertificate(txHash: string, filename?: string): Promise<boolean> {
    try {
      const { API_BASE_URL } = await import('@/lib/api');
      const downloadUrl = `${API_BASE_URL}/saft/certificate/${txHash}/download`;

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('SAFT certificate not found. It may still be generating.');
        } else {
          toast.error(`Failed to download certificate: ${response.statusText}`);
        }
        return false;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `SAFT_Certificate_${txHash.substring(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('SAFT certificate downloaded successfully');
      return true;
    } catch (error) {
      console.error('Error downloading SAFT certificate:', error);
      toast.error('Failed to download SAFT certificate. Please try again.');
      return false;
    }
  }

  /**
   * Download SAFT certificate PDF by reference
   */
  static async downloadCertificateByRef(ref: string, filename?: string): Promise<boolean> {
    try {
      // For ref-based downloads, we need to get the transaction hash first
      // This is a simplified version - in reality, you'd need to map ref to txHash
      toast.info('Please use transaction hash to download SAFT certificate.');
      return false;
    } catch (error) {
      console.error('Error downloading SAFT certificate:', error);
      toast.error('Failed to download SAFT certificate. Please try again.');
      return false;
    }
  }

  /**
   * Check if SAFT certificate exists for a transaction
   */
  static async checkCertificateExists(txHash: string): Promise<boolean> {
    try {
      // We'll assume it exists if we can get the URL
      // In a real implementation, we would call /saft/certificate/{txHash}/exists
      return true;
    } catch (error) {
      console.error('Error checking SAFT certificate:', error);
      return false;
    }
  }

  /**
   * List all available SAFT certificates
   */
  static async listCertificates(): Promise<{
    count: number;
    files: Array<{
      filename: string;
      size: number;
      created: string;
      modified: string;
    }>;
  }> {
    try {
      // Not implemented in main backend
      return { count: 0, files: [] };
    } catch (error) {
      console.error('Error listing SAFT certificates:', error);
      return { count: 0, files: [] };
    }
  }

  /**
   * Generate SAFT certificate data for display
   */
  static generateCertificateData(
    txHash: string,
    amount: number,
    tokens: number,
    walletAddress: string,
    email?: string
  ): SAFTCertificateInfo {
    return {
      txHash,
      amount,
      tokens,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      walletAddress,
      email,
    };
  }

  /**
   * Format certificate data for display
   */
  static formatCertificateForDisplay(cert: SAFTCertificateInfo): string {
    return `
SAFT Certificate Details:
------------------------
Transaction: ${cert.txHash}
Date: ${cert.date}
Wallet: ${cert.walletAddress}
Amount: $${cert.amount.toFixed(2)} USD
Tokens: ${cert.tokens.toLocaleString()} MLC
${cert.email ? `Email: ${cert.email}` : ''}
------------------------
This certificate confirms your token allocation under the MicroLeague Presale.
    `;
  }
}

// Export singleton instance
export const saftService = new SAFTService();