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
import { Menu, Moon, Sun, LogOut, LayoutDashboard, Car } from "lucide-react";
import { useState } from "react";

function CarShukLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" data-testid="link-home-logo">
      <div className={`flex items-center gap-2 ${className}`}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="CarShuk logo"
        >
          <rect width="32" height="32" rx="6" className="fill-primary" />
          <path
            d="M6 20.5h20M8 20.5l1.5-5.5h13l1.5 5.5M10.5 15l1-3.5h9l1 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="20.5" r="2" fill="white" />
          <circle cx="21" cy="20.5" r="2" fill="white" />
        </svg>
        <span className="text-lg font-bold tracking-tight text-foreground">
          CAR<span className="text-primary">SHUK</span>
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

  const navLinks = [
    { href: "/browse", label: "Browse Cars" },
    { href: "/sell", label: "Sell My Car" },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "My Listings" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <CarShukLogo />
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-primary after:rounded-full after:transition-transform after:duration-200 ${
                    location === link.href
                      ? "text-primary bg-primary/8 after:scale-x-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            data-testid="button-theme-toggle"
            className="h-9 w-9"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-testid="button-user-menu"
                  className="hidden h-9 gap-2 px-3 md:flex"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user.firstName[0]}
                  </div>
                  <span className="text-sm">{user.firstName}</span>
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
                variant="default"
                size="sm"
                data-testid="button-sign-in"
                className="hidden md:inline-flex"
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
                className="h-9 w-9 md:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <span
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        location === link.href
                          ? "text-primary bg-primary/8"
                          : "text-foreground hover:bg-muted"
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
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground rounded-md hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link href="/auth" onClick={() => setMobileOpen(false)}>
                    <span
                      data-testid="link-mobile-sign-in"
                      className="block px-3 py-2.5 text-sm font-medium text-primary"
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
