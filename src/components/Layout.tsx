import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Target, Map, BookOpen, Briefcase,
  Video, TrendingUp, Menu, X, Globe, LogOut, LogIn
} from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { path: "/resume", label: t("nav.resume"), icon: FileText },
    { path: "/skills", label: t("nav.skills"), icon: Target },
    { path: "/roadmap", label: t("nav.roadmap"), icon: Map },
    { path: "/courses", label: t("nav.courses"), icon: BookOpen },
    { path: "/jobs", label: t("nav.jobs"), icon: Briefcase },
    { path: "/video-notes", label: t("nav.video"), icon: Video },
    { path: "/progress", label: t("nav.progress"), icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">SB</span>
              </div>
              <span className="font-display text-lg font-bold">SkillBridge</span>
            </Link>
          </div>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="gap-1.5"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "हिंदी" : "EN"}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/login")} className="gap-1.5">
                <LogIn className="h-4 w-4" />
                {t("nav.login")}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && isAuthenticated && (
        <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
};

export default Layout;
