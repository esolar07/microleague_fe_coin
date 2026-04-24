import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AuthModal from "@/components/modals/AuthModal";
import { useAuth } from "@/hooks/use-auth";
import { useDisconnect } from "wagmi";
import { useSignOut } from "@coinbase/cdp-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { smartRedirect } from "@/utils/ssoRedirect";
import { performCompleteLogout } from "@/utils/logout";
import logo from "@/assets/logo.webp";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isAuthenticated, token, logout } = useAuth();
  const { disconnect } = useDisconnect();
  const { signOut } = useSignOut();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const navLinks = [
    {
      label: "Simulate",
      onClick: () => smartRedirect("simulate", isAuthenticated, token),
    },
    {
      label: "Tournament",
      onClick: () => smartRedirect("tournament", isAuthenticated, token),
    },
    { label: "Clubhouse", href: "/clubhouse" },
    { label: "Coin", href: "/" },
  ];

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Sign out from Coinbase CDP session
      await signOut();
    } catch (err: unknown) {
      // Session may already be expired (401) - that's fine
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("401") && !msg.includes("Unauthorized")) {
        console.error("signOut error:", err);
      }
    }

    // Disconnect wallet
    disconnect();

    // Clear auth state
    logout();

    // Perform comprehensive cleanup
    await performCompleteLogout(queryClient);

    // Navigate to home
    navigate("/");
    setLoggingOut(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mlc-container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="MicroLeague"
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={link.onClick}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                ),
              )}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="mlc-btn-primary text-sm px-4 py-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {loggingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLaunchApp}
                  className="hidden sm:block mlc-btn-primary text-sm px-4 py-2"
                >
                  Launch App
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border"
            >
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={link.label}
                      onClick={() => {
                        setIsMenuOpen(false);
                        link.onClick?.();
                      }}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                    >
                      {link.label}
                    </button>
                  ),
                )}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="mlc-btn-primary text-sm text-center py-2"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={loggingOut}
                      className="flex items-center justify-center gap-1.5 text-sm py-2 px-3 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {loggingOut ? "Signing out..." : "Logout & Disconnect"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLaunchApp();
                    }}
                    className="mlc-btn-primary text-sm text-center py-2"
                  >
                    Launch App
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;
