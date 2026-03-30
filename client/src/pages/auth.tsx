import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Loader2, ShieldCheck, Car, Users } from "lucide-react";

export default function Auth() {
  const [, navigate] = useLocation();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  // Sign in state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up state
  const [signupFirst, setSignupFirst] = useState("");
  const [signupLast, setSignupLast] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [isDealer, setIsDealer] = useState(false);
  const [dealerName, setDealerName] = useState("");

  const handleLogin = async () => {
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Welcome back!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        username: signupEmail,
        password: signupPassword,
        firstName: signupFirst,
        lastName: signupLast,
        phone: signupPhone || undefined,
        isDealer,
        dealerName: isDealer ? dealerName : undefined,
      });
      toast({ title: "Account created!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex">
      {/* Left branding panel — deep teal, white text */}
      <div
        className="hidden lg:flex lg:w-[420px] shrink-0 flex-col justify-center px-12 py-16"
        style={{ backgroundColor: "hsl(175 84% 22%)" }}
      >
        {/* Logo mark */}
        <div className="mb-10">
          <svg
            width="36"
            height="36"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
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
          <p
            className="text-xl text-white mt-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="font-medium">CAR</span>
            <span className="font-bold">SHUK</span>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white leading-tight tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          The smarter way<br />to buy and sell cars.
        </h2>
        <p className="mt-4 text-sm text-white/70 leading-relaxed">
          Join thousands of buyers and sellers in your community.
        </p>

        {/* Trust signals */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">No buyer fees</p>
              <p className="text-xs text-white/60">Always free to browse and buy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Verified community</p>
              <p className="text-xs text-white/60">Real sellers, real prices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Car className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">500+ active listings</p>
              <p className="text-xs text-white/60">New cars added daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-auth-title">
              Welcome to CarShuk
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in or create an account to get started.
            </p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-0.5 rounded-lg h-auto">
              <TabsTrigger
                value="signin"
                data-testid="tab-signin"
                className="rounded-md py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                data-testid="tab-signup"
                className="rounded-md py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  data-testid="input-login-email"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-testid="input-login-password"
                  className="h-10"
                />
              </div>
              <Button
                className="w-full h-10"
                onClick={handleLogin}
                disabled={isLoading || !loginEmail || !loginPassword}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Demo: moshe@carshuk.com / demo123
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">First Name</Label>
                  <Input
                    value={signupFirst}
                    onChange={(e) => setSignupFirst(e.target.value)}
                    data-testid="input-signup-first"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Last Name</Label>
                  <Input
                    value={signupLast}
                    onChange={(e) => setSignupLast(e.target.value)}
                    data-testid="input-signup-last"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  data-testid="input-signup-email"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  data-testid="input-signup-password"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  type="tel"
                  placeholder="123-456-7890"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  data-testid="input-signup-phone"
                  className="h-10"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">I'm a dealer</p>
                  <p className="text-xs text-muted-foreground">Toggle if listing for a dealership</p>
                </div>
                <Switch
                  checked={isDealer}
                  onCheckedChange={setIsDealer}
                  data-testid="switch-dealer"
                />
              </div>

              {isDealer && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Dealer Name</Label>
                  <Input
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    placeholder="e.g. Premium Auto Group"
                    data-testid="input-dealer-name"
                    className="h-10"
                  />
                </div>
              )}

              <Button
                className="w-full h-10"
                onClick={handleRegister}
                disabled={isLoading || !signupFirst || !signupLast || !signupEmail || !signupPassword}
                data-testid="button-register"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
