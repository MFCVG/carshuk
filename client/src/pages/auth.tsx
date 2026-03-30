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
import { Loader2 } from "lucide-react";

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
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground" data-testid="text-auth-title">Welcome to <span className="text-primary">CarShuk</span></h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in or create an account to get started.</p>
      </div>

      <Card className="p-6 shadow-lg border-t-2 border-t-primary/60">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-5">
            <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-testid="input-login-password"
              />
            </div>
            <Button
              className="w-full"
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
                <Label className="text-sm">First Name</Label>
                <Input
                  value={signupFirst}
                  onChange={(e) => setSignupFirst(e.target.value)}
                  data-testid="input-signup-first"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Last Name</Label>
                <Input
                  value={signupLast}
                  onChange={(e) => setSignupLast(e.target.value)}
                  data-testid="input-signup-last"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                data-testid="input-signup-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                data-testid="input-signup-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phone (optional)</Label>
              <Input
                type="tel"
                placeholder="123-456-7890"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                data-testid="input-signup-phone"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">I'm a dealer</p>
                <p className="text-xs text-muted-foreground">Toggle if you're listing for a dealership</p>
              </div>
              <Switch
                checked={isDealer}
                onCheckedChange={setIsDealer}
                data-testid="switch-dealer"
              />
            </div>

            {isDealer && (
              <div className="space-y-1.5">
                <Label className="text-sm">Dealer Name</Label>
                <Input
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="e.g. Premium Auto Group"
                  data-testid="input-dealer-name"
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={isLoading || !signupFirst || !signupLast || !signupEmail || !signupPassword}
              data-testid="button-register"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
