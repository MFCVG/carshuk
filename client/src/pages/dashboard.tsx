import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Car, Trash2, Heart, Search, Plus, ExternalLink, MapPin, Gauge } from "lucide-react";
import type { Listing, SavedSearch, Favorite } from "@shared/schema";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: myListings, isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ["/api/listings", "user", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/listings?userId=${user!.id}`);
      return res.json();
    },
  });

  const { data: savedSearches, isLoading: loadingSearches } = useQuery<SavedSearch[]>({
    queryKey: ["/api/saved-searches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/saved-searches/${user!.id}`);
      return res.json();
    },
  });

  const { data: favorites, isLoading: loadingFavs } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/favorites/${user!.id}`);
      return res.json();
    },
  });

  // Get listing details for favorites
  const favListingIds = favorites?.map((f) => f.listingId) || [];
  const { data: favListings } = useQuery<Listing[]>({
    queryKey: ["/api/listings", "favorites", favListingIds.join(",")],
    enabled: favListingIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        favListingIds.map(async (id) => {
          try {
            const res = await apiRequest("GET", `/api/listings/${id}`);
            return res.json();
          } catch {
            return null;
          }
        })
      );
      return results.filter(Boolean);
    },
  });

  const deleteSearchMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/saved-searches/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Search deleted" });
      if (user) queryClient.invalidateQueries({ queryKey: ["/api/saved-searches", user.id] });
    },
  });

  const removeFavMut = useMutation({
    mutationFn: async (listingId: number) => {
      await apiRequest("DELETE", `/api/favorites/${user!.id}/${listingId}`);
    },
    onSuccess: () => {
      toast({ title: "Removed from favorites" });
      if (user) queryClient.invalidateQueries({ queryKey: ["/api/favorites", user.id] });
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Sign in to view your dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">Access your listings, saved searches, and favorites.</p>
        <Button asChild>
          <a href="/#/auth" data-testid="link-auth-dashboard">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user.firstName}</p>
        </div>
        <Link href="/sell">
          <Button className="gap-2" data-testid="button-new-listing">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-5">
          <TabsTrigger value="listings" data-testid="tab-my-listings">
            My Listings ({myListings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="favorites" data-testid="tab-favorites">
            Favorites ({favorites?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="searches" data-testid="tab-saved-searches">
            Saved Searches ({savedSearches?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* My Listings */}
        <TabsContent value="listings">
          {loadingListings ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !myListings?.length ? (
            <Card className="p-8 text-center">
              <Car className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">You haven't listed any vehicles yet.</p>
              <Link href="/sell">
                <Button variant="link" className="mt-2 text-primary" data-testid="link-create-first">
                  Create your first listing
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <Card key={listing.id} className="p-4 flex items-center gap-4" data-testid={`card-my-listing-${listing.id}`}>
                  <div className="h-14 w-20 shrink-0 rounded-md bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center">
                    <Car className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${listing.id}`}>
                      <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                        {listing.title}
                      </span>
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-primary">{formatPrice(listing.price)}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{Number(listing.mileage).toLocaleString()} mi</span>
                      {listing.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.city}, {listing.state}</span>}
                    </div>
                  </div>
                  <Badge variant={listing.status === "active" ? "default" : "secondary"} className="capitalize shrink-0">
                    {listing.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites">
          {loadingFavs ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !favorites?.length ? (
            <Card className="p-8 text-center">
              <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No favorites yet. Browse listings and save your picks.</p>
              <Link href="/browse">
                <Button variant="link" className="mt-2 text-primary" data-testid="link-browse-fav">Browse Cars</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {favListings?.map((listing) => (
                <Card key={listing.id} className="p-4 flex items-center gap-4" data-testid={`card-fav-${listing.id}`}>
                  <div className="h-14 w-20 shrink-0 rounded-md bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center">
                    <Car className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${listing.id}`}>
                      <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                        {listing.title}
                      </span>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-primary">{formatPrice(listing.price)}</span>
                      {listing.city && ` · ${listing.city}, ${listing.state}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavMut.mutate(listing.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    data-testid={`button-remove-fav-${listing.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches */}
        <TabsContent value="searches">
          {loadingSearches ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !savedSearches?.length ? (
            <Card className="p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No saved searches yet.</p>
              <Link href="/browse">
                <Button variant="link" className="mt-2 text-primary" data-testid="link-browse-search">Browse and save a search</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <Card key={search.id} className="p-4 flex items-center gap-3" data-testid={`card-search-${search.id}`}>
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{search.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Saved {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/browse?${new URLSearchParams(JSON.parse(search.filters)).toString()}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-run-search-${search.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSearchMut.mutate(search.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      data-testid={`button-delete-search-${search.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
