import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard, Users, Car, Star, Eye, Pencil, Trash2, Loader2, ShieldAlert,
} from "lucide-react";
import type { Listing } from "@shared/schema";

interface AdminListing extends Listing {
  sellerName: string;
  sellerUsername: string;
}

interface AdminStats {
  totalListings: number;
  activeListings: number;
  totalUsers: number;
  featuredListings: number;
  totalViews: number;
}

function formatPrice(n: number) {
  return "$" + n.toLocaleString();
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", price: "", mileage: "", description: "", status: "active", featured: false,
  });

  const isAdmin = user?.username === "admin@carshuk.com";

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: listings, isLoading } = useQuery<AdminListing[]>({
    queryKey: ["/api/admin/listings"],
    enabled: isAdmin,
  });

  const updateMut = useMutation({
    mutationFn: async (data: { id: number; updates: Record<string, any> }) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Listing updated" });
      setEditingListing(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Listing deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleToggleFeatured = (listing: AdminListing) => {
    updateMut.mutate({ id: listing.id, updates: { featured: !listing.featured } });
  };

  const handleDelete = (listing: AdminListing) => {
    if (confirm(`Delete "${listing.title}"?`)) {
      deleteMut.mutate(listing.id);
    }
  };

  const openEdit = (listing: AdminListing) => {
    setEditForm({
      title: listing.title,
      price: String(listing.price),
      mileage: String(listing.mileage),
      description: listing.description || "",
      status: listing.status || "active",
      featured: listing.featured || false,
    });
    setEditingListing(listing);
  };

  const handleSaveEdit = () => {
    if (!editingListing) return;
    updateMut.mutate({
      id: editingListing.id,
      updates: {
        title: editForm.title,
        price: Number(editForm.price),
        mileage: Number(editForm.mileage),
        description: editForm.description || null,
        status: editForm.status,
        featured: editForm.featured,
      },
    });
  };

  // Parse first image from listing
  const getThumb = (listing: AdminListing): string | null => {
    try {
      const imgs = JSON.parse(listing.images || "[]");
      return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;
    } catch { return null; }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground">Please sign in as an admin to access this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You don't have admin privileges. Sign in as admin@carshuk.com.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats?.totalListings ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Total Listings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Car className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats?.activeListings ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Active Listings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats?.totalUsers ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats?.featuredListings ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Listings table */}
      <Card>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">All Listings</h2>
          <span className="text-xs text-muted-foreground">{listings?.length ?? 0} total</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Featured</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings?.map((listing) => {
                const thumb = getThumb(listing);
                return (
                  <TableRow key={listing.id}>
                    <TableCell className="font-mono text-xs">{listing.id}</TableCell>
                    <TableCell>
                      {thumb ? (
                        <img src={thumb} alt="" className="h-10 w-14 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-14 rounded bg-muted flex items-center justify-center">
                          <Car className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.make} {listing.model} · {listing.year}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-sm tabular-nums">{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <p className="text-xs text-foreground">{listing.sellerName}</p>
                      <p className="text-[10px] text-muted-foreground">{listing.sellerType}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{listing.city}, {listing.state}</TableCell>
                    <TableCell>
                      <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleFeatured(listing)}
                        className={`p-1 rounded transition-colors ${listing.featured ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground/40 hover:text-amber-500"}`}
                        title={listing.featured ? "Remove featured" : "Make featured"}
                      >
                        <Star className={`h-4 w-4 ${listing.featured ? "fill-current" : ""}`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(listing)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editingListing} onOpenChange={(open) => { if (!open) setEditingListing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Price</Label>
                <Input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Mileage</Label>
                <Input type="number" value={editForm.mileage} onChange={(e) => setEditForm((f) => ({ ...f, mileage: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-2.5">
              <Label className="text-sm">Featured</Label>
              <Switch checked={editForm.featured} onCheckedChange={(v) => setEditForm((f) => ({ ...f, featured: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListing(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMut.isPending} className="gap-2">
              {updateMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
