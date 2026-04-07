import { motion } from "framer-motion";
import {
  CheckCircle, Clock, XCircle, AlertCircle, ArrowRight, Coins
} from "lucide-react";

interface ClaimRequest {
  id: string;
  date: string;
  amount: number;
  type: "vesting" | "reward";
  status: "pending" | "approved" | "processing" | "completed" | "rejected";
  txHash?: string;
  note?: string;
}

const claimRequests: ClaimRequest[] = [
  {
    id: "CLM-001",
    date: "Feb 10, 2026",
    amount: 1000,
    type: "vesting",
    status: "completed",
    txHash: "0xabc...def1",
    note: "Q1 2026 vesting release",
  },
  {
    id: "CLM-002",
    date: "Feb 9, 2026",
    amount: 250,
    type: "reward",
    status: "approved",
    note: "Quest reward: Refer 3 Friends",
  },
  {
    id: "CLM-003",
    date: "Feb 8, 2026",
    amount: 500,
    type: "vesting",
    status: "processing",
    note: "Q1 bonus claim",
  },
  {
    id: "CLM-004",
    date: "Feb 7, 2026",
    amount: 100,
    type: "reward",
    status: "pending",
    note: "Social media quest reward",
  },
  {
    id: "CLM-005",
    date: "Feb 5, 2026",
    amount: 2000,
    type: "vesting",
    status: "rejected",
    note: "Cliff period not yet reached",
  },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", label: "Approved" },
  processing: { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10", label: "Processing" },
  completed: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Completed" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected" },
};

const ClaimRequestsHistory = () => {
  return (
    <div className="mlc-card-elevated">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Claim Requests</h3>
        <span className="text-xs text-muted-foreground">{claimRequests.length} requests</span>
      </div>

      <div className="space-y-0">
        {claimRequests.map((request, index) => {
          const config = statusConfig[request.status];
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-4 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{request.id}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{request.note}</p>
                  <p className="text-xs text-muted-foreground">{request.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {request.amount.toLocaleString()} MLC
                </p>
                {request.txHash && (
                  <p className="text-xs text-primary font-mono mt-0.5">{request.txHash}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimRequestsHistory;
