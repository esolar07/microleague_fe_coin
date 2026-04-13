import { User } from "lucide-react";

interface UserAvatarProps {
  avatar?: string | null;
  displayName?: string;
  email?: string;
  walletAddress?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Derives up to 2 initials from the best available identity info. */
function getInitials(
  displayName?: string,
  email?: string,
  walletAddress?: string
): string | null {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    const local = email.split("@")[0];
    return local.slice(0, 2).toUpperCase();
  }
  if (walletAddress) {
    // Use chars 2-4 of the hex address (skip "0x")
    return walletAddress.slice(2, 4).toUpperCase();
  }
  return null;
}

const sizeMap = {
  sm: { outer: "w-8 h-8", text: "text-xs", icon: "w-4 h-4" },
  md: { outer: "w-10 h-10", text: "text-sm", icon: "w-5 h-5" },
  lg: { outer: "w-20 h-20", text: "text-xl", icon: "w-10 h-10" },
};

const UserAvatar = ({
  avatar,
  displayName,
  email,
  walletAddress,
  size = "md",
  className = "",
}: UserAvatarProps) => {
  const { outer, text, icon } = sizeMap[size];
  const initials = getInitials(displayName, email, walletAddress);

  return (
    <div
      className={`${outer} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
    >
      {avatar ? (
        <img src={avatar} alt={displayName ?? "avatar"} className="w-full h-full object-cover" />
      ) : initials ? (
        <span className={`${text} font-semibold text-primary select-none`}>{initials}</span>
      ) : (
        <User className={`${icon} text-primary`} />
      )}
    </div>
  );
};

export default UserAvatar;
