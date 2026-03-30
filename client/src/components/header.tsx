import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";

function CarShukLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" data-testid="link-home-logo">
      <div className={`flex items-center gap-2.5 ${className}`}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="CarShuk logo"
          className="text-primary"
        >
          <path
            d="M4 17.5h20M5.5 17.5l2-6h13l2 6M8.5 11.5l1.5-4h8l1.5 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="17.5" r="2" fill="currentColor" />
          <circle cx="19" cy="17.5" r="2" fill="currentColor" />
        </svg>
        <span
          className="text-base tracking-tight text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="font-medium">CAR</span>
          <span className="font-bold">SHUK</span>
        </span>
      </div>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subtle shadow on scroll
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 4);
    }, { passive: true });
  }

  const navLinks = [
    { href: "/browse", label: "Browse Cars" },
    { href: "/sell", label: "Sell My Car" },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "My Listings" });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between px-6 rounded-full bg-white/95 dark:bg-background/95 backdrop-blur-md transition-shadow duration-200 ${
          scrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="flex items-center gap-8">
          <CarShukLogo />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                    location === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {/* WhatsApp nav button */}
          <a
            href="https://wa.me/?text=Check%20out%20CarShuk%20-%20carshuk.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
              data-testid="button-whatsapp-nav"
            >
              <SiWhatsapp className="h-4 w-4" />
            </Button>
          </a>

          {/* Saved/favorites link */}
          {user && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
                data-testid="button-saved"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            data-testid="button-theme-toggle"
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-testid="button-user-menu"
                  className="hidden h-9 gap-2 px-3 md:flex text-sm font-medium rounded-full"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {user.firstName[0]}
                  </div>
                  <span>{user.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button
                size="sm"
                data-testid="button-sign-in"
                className="hidden md:inline-flex h-8 px-5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden rounded-full"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              <nav className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <span
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        location === link.href
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    data-testid="button-mobile-logout"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link href="/auth" onClick={() => setMobileOpen(false)}>
                    <span
                      data-testid="link-mobile-sign-in"
                      className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      Sign In
                    </span>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
