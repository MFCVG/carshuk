import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/browse">
                  <span data-testid="link-footer-browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Browse Cars
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/sell">
                  <span data-testid="link-footer-sell" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sell My Car
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/browse">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    New Listings
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">Pricing Guide</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">VIN Lookup</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Vehicle History</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">FAQ</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Contact Us</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Safety Tips</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@carshuk.com"
                  data-testid="link-footer-email"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@carshuk.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">&copy; 2026 Carshuk LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-xs text-muted-foreground">Privacy Policy</span>
            <span className="text-xs text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
