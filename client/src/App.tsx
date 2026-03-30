import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomePage from "@/pages/home";
import BrowseListings from "@/pages/browse";
import ListingDetail from "@/pages/listing-detail";
import CreateListing from "@/pages/create-listing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

function SeedData() {
  useEffect(() => {
    apiRequest("POST", "/api/seed").catch(() => {});
  }, []);
  return null;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/browse" component={BrowseListings} />
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/sell" component={CreateListing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <SeedData />
            <Router hook={useHashLocation}>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <AppRouter />
                </main>
                <Footer />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
