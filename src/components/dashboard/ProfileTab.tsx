import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Wallet, Save, Loader2,
  CheckCircle, AlertCircle, Camera, Calendar, Copy, Check, LogOut,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/use-auth";
import { useDisconnect } from "wagmi";
import { useSignOut } from "@coinbase/cdp-hooks";
import { useNavigate } from "react-router-dom";
import {
  uploadAvatar,
} from "@/services/userProfile";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import UserAvatar from "@/components/ui/UserAvatar";

const ProfileTab = () => {
  const { address } = useAccount();
  const { user, logout } = useAuth();
  const { currentUser } = useCurrentUser();
  const { disconnect } = useDisconnect();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Avatar + copy state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(currentUser?.authenticationMethods?.email?.email ?? "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const walletAddress = address ?? user?.walletAddress ?? "";

  // Fetch profile via React Query
  const { data: profile, isLoading: loading } = useUserProfile(walletAddress || undefined);
  const updateProfileMutation = useUpdateUserProfile(walletAddress);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setEmail(profile.email ?? "");
      setBio(profile.bio ?? "");
    } else if (user?.profile) {
      setDisplayName(
        [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ") || ""
      );
      setEmail(user.profile.email ?? "");
    }
  }, [profile, user]);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!walletAddress) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await updateProfileMutation.mutateAsync({
        displayName: displayName.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !walletAddress) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(walletAddress, file);
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
    }
  };

  const copyWallet = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      // silent — session may already be expired
    }
    logout();
    disconnect();
    navigate("/");
  };

  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  const joinedDate = profile?.joinedDate ?? user?.createdAt;
  const formattedJoinDate = joinedDate
    ? new Date(joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Profile Header Card */}
      <div className="mlc-card-elevated">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative group">
            <UserAvatar
              avatar={profile?.avatar}
              displayName={displayName}
              email={email}
              walletAddress={walletAddress}
              size="lg"
            />
            <label
              className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
              aria-label="Upload avatar"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {displayName || truncatedWallet}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Joined {formattedJoinDate}
              </p>
            </div>
            {user?.referralId && (
              <p className="text-xs text-muted-foreground mt-1">
                Referral ID: <span className="font-mono">{user.referralId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-display-name" className="text-sm font-medium text-foreground">
              Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="mlc-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mlc-input mt-2"
              />
              {profile?.isEmailVerified && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 flex items-center gap-1 text-xs text-success">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="profile-bio" className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="mlc-input mt-2 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={saving}
            className="mlc-btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>

          {saveStatus === "success" && (
            <span className="text-sm text-success flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Failed to save
            </span>
          )}
        </div>
      </div>

      {/* Wallet Settings */}
      <div className="mlc-card-elevated">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Wallet</h3>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
            <p className="font-mono text-foreground">{truncatedWallet}</p>
          </div>
          <button
            onClick={copyWallet}
            className="mlc-btn-secondary text-sm flex items-center gap-1.5"
            aria-label="Copy wallet address"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {user?.walletType && (
          <p className="text-xs text-muted-foreground mt-3">
            Wallet type: <span className="capitalize">{user.walletType}</span>
          </p>
        )}
      </div>

      {/* Logout */}
      <div className="mlc-card-elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Sign Out</p>
            <p className="text-sm text-muted-foreground">Disconnect your wallet and clear your session</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {loggingOut ? "Signing out..." : "Logout & Disconnect"}
          </motion.button>
        </div>
      </div>

      {/* Security & Preferences */}
      {/* <div className="mlc-card-elevated">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">Security & Preferences</h3>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Two-Factor Authentication"
            description="Add extra security to your account"
            checked={twoFactor}
            disabled={savingPrefs}
            onChange={(v) => { setTwoFactor(v); }}
          />
          <ToggleRow
            label="Login Notifications"
            description="Get notified of new logins"
            checked={notifications}
            disabled={savingPrefs}
            onChange={(v) => { setNotifications(v); }}
          />
          <ToggleRow
            label="Newsletter"
            description="Receive updates and announcements"
            checked={newsletter}
            disabled={savingPrefs}
            onChange={(v) => { setNewsletter(v); }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSavePreferences}
          disabled={savingPrefs}
          className="mlc-btn-secondary mt-4 flex items-center gap-2 text-sm"
        >
          {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </motion.button>
      </div> */}
    </motion.div>
  );
};

/* ── Toggle Row ─────────────────────────────────────────── */

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

export default ProfileTab;
