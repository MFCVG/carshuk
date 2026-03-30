import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, CheckCircle2, Search, ArrowLeft, ArrowRight, DollarSign,
  Car, Cog, Shield, Factory, Zap, Database,
} from "lucide-react";
import type { VinDecodeResult, PriceEstimate } from "@shared/schema";

const bodyTypes = ["Sedan", "SUV", "Truck", "Minivan", "Coupe", "Convertible", "Hatchback", "Wagon"];
const transmissions = ["Automatic", "Manual"];
const drivetrains = ["FWD", "AWD", "4WD", "RWD"];
const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const conditions = ["new", "excellent", "good", "fair", "poor"];
const titleStatuses = ["clean", "salvage", "rebuilt", "flood", "lemon"];

interface FormData {
  vin: string;
  make: string; model: string; year: string; trim: string;
  bodyType: string; exteriorColor: string; interiorColor: string;
  transmission: string; drivetrain: string; fuelType: string; engineSize: string;
  price: string; mileage: string; condition: string; description: string;
  city: string; state: string; zipCode: string;
  numOwners: string; accidentHistory: boolean; titleStatus: string;
  sellerType: string;
}

const defaultForm: FormData = {
  vin: "", make: "", model: "", year: "", trim: "", bodyType: "", exteriorColor: "",
  interiorColor: "", transmission: "", drivetrain: "", fuelType: "", engineSize: "",
  price: "", mileage: "", condition: "used", description: "",
  city: "", state: "", zipCode: "", numOwners: "1", accidentHistory: false,
  titleStatus: "clean", sellerType: "private",
};

function Stepper({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-xs font-medium ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function SafetyCheck({ label, value }: { label: string; value: string }) {
  if (!value || value === "" || value === "Not Applicable") return null;
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      <span className="text-xs text-foreground">{label}</span>
    </div>
  );
}

function VinDecodeCard({ data }: { data: VinDecodeResult }) {
  // Count non-empty fields
  const dataPoints = Object.values(data).filter((v) => v && v !== "" && v !== "0").length;

  const safetyFeatures = [
    { label: "ABS", value: data.abs },
    { label: "ESC", value: data.esc },
    { label: "Traction Control", value: data.tractionControl },
    { label: "Front Airbags", value: data.airbagFront },
    { label: "Side Airbags", value: data.airbagSide },
    { label: "Curtain Airbags", value: data.airbagCurtain },
    { label: "Forward Collision Warning", value: data.forwardCollisionWarning },
    { label: "Lane Departure Warning", value: data.laneDepartureWarning },
    { label: "Lane Keep Assist", value: data.laneKeepAssist },
    { label: "Adaptive Cruise Control", value: data.adaptiveCruise },
    { label: "Backup Camera", value: data.backupCamera },
    { label: "Blind Spot Monitoring", value: data.blindSpotMonitoring },
  ].filter((f) => f.value && f.value !== "" && f.value !== "Not Applicable");

  const engineDisplay = [
    data.engineSize,
    data.engineCylinders ? `${data.engineCylinders}-cyl` : "",
    data.engineHP ? `${data.engineHP} HP` : "",
  ].filter(Boolean).join(" · ");

  const plantDisplay = [data.plantCity, data.plantState, data.plantCountry].filter(Boolean).join(", ");

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden" data-testid="vin-decode-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-emerald-200/60 dark:border-emerald-800/30 bg-emerald-100/50 dark:bg-emerald-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Vehicle Identified</p>
              <p className="text-base font-bold text-foreground">
                {data.year} {data.make} {data.model}
              </p>
            </div>
          </div>
          {data.vehicleType && (
            <Badge variant="secondary" className="text-xs">{data.vehicleType}</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Powertrain */}
        {(engineDisplay || data.transmission || data.drivetrain || data.fuelType) && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Cog className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Powertrain</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {engineDisplay && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Engine</p>
                  <p className="text-xs font-medium text-foreground">{engineDisplay}</p>
                </div>
              )}
              {data.transmission && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Transmission</p>
                  <p className="text-xs font-medium text-foreground">{data.transmission}</p>
                </div>
              )}
              {data.drivetrain && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Drivetrain</p>
                  <p className="text-xs font-medium text-foreground">{data.drivetrain}</p>
                </div>
              )}
              {data.fuelType && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Fuel Type</p>
                  <p className="text-xs font-medium text-foreground">{data.fuelType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specifications */}
        {(data.doors || data.seats || data.bodyType) && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specifications</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {data.doors && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Doors</p>
                  <p className="text-xs font-medium text-foreground">{data.doors}</p>
                </div>
              )}
              {data.seats && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Seats</p>
                  <p className="text-xs font-medium text-foreground">{data.seats}</p>
                </div>
              )}
              {data.bodyType && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Body Type</p>
                  <p className="text-xs font-medium text-foreground">{data.bodyType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Safety Features */}
        {safetyFeatures.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety Features</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {safetyFeatures.map((f) => (
                <SafetyCheck key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          </div>
        )}

        {/* Manufacturing */}
        {(plantDisplay || data.manufacturer) && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Factory className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manufacturing</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {plantDisplay && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Plant</p>
                  <p className="text-xs font-medium text-foreground">{plantDisplay}</p>
                </div>
              )}
              {data.manufacturer && (
                <div className="rounded-md bg-white dark:bg-card p-2">
                  <p className="text-[10px] text-muted-foreground">Manufacturer</p>
                  <p className="text-xs font-medium text-foreground">{data.manufacturer}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data points count */}
        <div className="flex items-center gap-1.5 pt-1">
          <Database className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs text-primary font-medium" data-testid="text-data-points">
            Found {dataPoints} data points for this vehicle
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CreateListing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [vinDecoded, setVinDecoded] = useState(false);
  const [vinData, setVinData] = useState<VinDecodeResult | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  const set = (key: keyof FormData) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const vinMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", `/api/vin/${form.vin}`);
      return res.json() as Promise<VinDecodeResult>;
    },
    onSuccess: (data) => {
      setForm((f) => ({
        ...f,
        make: data.make || f.make,
        model: data.model || f.model,
        year: data.year ? String(data.year) : f.year,
        trim: data.trim || f.trim,
        bodyType: data.bodyType || f.bodyType,
        transmission: data.transmission || f.transmission,
        drivetrain: data.drivetrain || f.drivetrain,
        fuelType: data.fuelType || f.fuelType,
        engineSize: data.engineSize || f.engineSize,
      }));
      setVinDecoded(true);
      setVinData(data);
      toast({ title: "VIN decoded", description: `${data.year} ${data.make} ${data.model}` });
    },
    onError: (err: Error) => {
      toast({ title: "VIN decode failed", description: err.message, variant: "destructive" });
    },
  });

  const priceMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/estimate-price", {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        mileage: Number(form.mileage),
        condition: form.condition,
      });
      return res.json() as Promise<PriceEstimate>;
    },
    onSuccess: (data) => {
      setPriceEstimate(data);
    },
    onError: (err: Error) => {
      toast({ title: "Estimate failed", description: err.message, variant: "destructive" });
    },
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      const res = await apiRequest("POST", "/api/listings", {
        userId: user.id,
        vin: form.vin || null,
        title: `${form.year} ${form.make} ${form.model}${form.trim ? " " + form.trim : ""}`,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        trim: form.trim || null,
        bodyType: form.bodyType || null,
        exteriorColor: form.exteriorColor || null,
        interiorColor: form.interiorColor || null,
        transmission: form.transmission || null,
        drivetrain: form.drivetrain || null,
        fuelType: form.fuelType || null,
        engineSize: form.engineSize || null,
        mileage: Number(form.mileage),
        price: Number(form.price),
        description: form.description || null,
        condition: form.condition,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
        numOwners: form.numOwners ? Number(form.numOwners) : null,
        accidentHistory: form.accidentHistory,
        titleStatus: form.titleStatus,
        sellerType: form.sellerType,
        images: "[]",
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Listing created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      navigate(`/listings/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Sign in to sell your car</h2>
        <p className="text-sm text-muted-foreground mb-4">Create an account or sign in to list your vehicle.</p>
        <Button asChild>
          <a href="/#/auth" data-testid="link-auth-sell">Sign In</a>
        </Button>
      </div>
    );
  }

  const stepLabels = ["VIN Entry", "Vehicle Details", "Listing Details", "Review"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-bold text-foreground mb-1" data-testid="text-create-title">Sell Your Car</h1>
      <p className="text-sm text-muted-foreground mb-6">List your vehicle in a few simple steps.</p>

      <Stepper step={step} steps={stepLabels} />

      {/* Step 1: VIN */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Enter your VIN</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We'll auto-fill vehicle details from the 17-character VIN. You can also skip this step.
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="e.g. 1HGBH41JXMN109186"
              value={form.vin}
              onChange={(e) => set("vin")(e.target.value.toUpperCase())}
              maxLength={17}
              className="font-mono text-sm tracking-wider flex-1"
              data-testid="input-vin"
            />
            <Button
              onClick={() => vinMut.mutate()}
              disabled={form.vin.length !== 17 || vinMut.isPending}
              className="gap-2 shrink-0"
              data-testid="button-decode-vin"
            >
              {vinMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Decode VIN
            </Button>
          </div>

          {/* Rich VIN decode card */}
          {vinDecoded && vinData && (
            <VinDecodeCard data={vinData} />
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep(2)} data-testid="button-skip-vin">
              Skip
            </Button>
            <Button onClick={() => setStep(2)} disabled={!vinDecoded && form.vin.length > 0 && form.vin.length < 17} data-testid="button-step1-next" className="gap-1">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Vehicle details */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Vehicle Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Make *">
              <Input value={form.make} onChange={(e) => set("make")(e.target.value)} data-testid="input-make" />
            </FormField>
            <FormField label="Model *">
              <Input value={form.model} onChange={(e) => set("model")(e.target.value)} data-testid="input-model" />
            </FormField>
            <FormField label="Year *">
              <Input type="number" value={form.year} onChange={(e) => set("year")(e.target.value)} data-testid="input-year" />
            </FormField>
            <FormField label="Trim">
              <Input value={form.trim} onChange={(e) => set("trim")(e.target.value)} data-testid="input-trim" />
            </FormField>
            <FormField label="Body Type">
              <Select value={form.bodyType} onValueChange={set("bodyType")}>
                <SelectTrigger data-testid="select-body-type"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{bodyTypes.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Exterior Color">
              <Input value={form.exteriorColor} onChange={(e) => set("exteriorColor")(e.target.value)} data-testid="input-ext-color" />
            </FormField>
            <FormField label="Interior Color">
              <Input value={form.interiorColor} onChange={(e) => set("interiorColor")(e.target.value)} data-testid="input-int-color" />
            </FormField>
            <FormField label="Transmission">
              <Select value={form.transmission} onValueChange={set("transmission")}>
                <SelectTrigger data-testid="select-transmission"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{transmissions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Drivetrain">
              <Select value={form.drivetrain} onValueChange={set("drivetrain")}>
                <SelectTrigger data-testid="select-drivetrain"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{drivetrains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Fuel Type">
              <Select value={form.fuelType} onValueChange={set("fuelType")}>
                <SelectTrigger data-testid="select-fuel-type"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{fuelTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Engine Size">
              <Input value={form.engineSize} onChange={(e) => set("engineSize")(e.target.value)} placeholder="e.g. 2.0L Turbo" data-testid="input-engine" />
            </FormField>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1" data-testid="button-step2-back">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!form.make || !form.model || !form.year} className="gap-1" data-testid="button-step2-next">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Listing details */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Listing Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Price *">
              <Input type="number" value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="e.g. 25000" data-testid="input-price" />
            </FormField>
            <FormField label="Mileage *">
              <Input type="number" value={form.mileage} onChange={(e) => set("mileage")(e.target.value)} placeholder="e.g. 35000" data-testid="input-mileage" />
            </FormField>
            <FormField label="Condition">
              <Select value={form.condition} onValueChange={set("condition")}>
                <SelectTrigger data-testid="select-condition"><SelectValue /></SelectTrigger>
                <SelectContent>{conditions.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Seller Type">
              <Select value={form.sellerType} onValueChange={set("sellerType")}>
                <SelectTrigger data-testid="select-seller-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private Seller</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Description">
                <Textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={3} placeholder="Describe your vehicle…" data-testid="input-description" />
              </FormField>
            </div>
          </div>

          <Separator className="my-5" />
          <h3 className="text-sm font-semibold text-foreground mb-3">Location</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="City">
              <Input value={form.city} onChange={(e) => set("city")(e.target.value)} data-testid="input-city" />
            </FormField>
            <FormField label="State">
              <Input value={form.state} onChange={(e) => set("state")(e.target.value)} placeholder="e.g. NY" data-testid="input-state" />
            </FormField>
            <FormField label="ZIP Code">
              <Input value={form.zipCode} onChange={(e) => set("zipCode")(e.target.value)} data-testid="input-zip" />
            </FormField>
          </div>

          <Separator className="my-5" />
          <h3 className="text-sm font-semibold text-foreground mb-3">Vehicle History</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Number of Owners">
              <Input type="number" value={form.numOwners} onChange={(e) => set("numOwners")(e.target.value)} data-testid="input-owners" />
            </FormField>
            <FormField label="Title Status">
              <Select value={form.titleStatus} onValueChange={set("titleStatus")}>
                <SelectTrigger data-testid="select-title-status"><SelectValue /></SelectTrigger>
                <SelectContent>{titleStatuses.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <div className="flex items-end gap-3 pb-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.accidentHistory}
                  onCheckedChange={(v) => set("accidentHistory")(v)}
                  data-testid="switch-accidents"
                />
                <Label className="text-sm">Accident history</Label>
              </div>
            </div>
          </div>

          {/* Price estimate */}
          <div className="mt-5">
            <Button
              variant="outline"
              onClick={() => priceMut.mutate()}
              disabled={priceMut.isPending || !form.make || !form.year || !form.mileage}
              className="gap-2"
              data-testid="button-get-estimate"
            >
              {priceMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Get Price Estimate
            </Button>
            {priceEstimate && (
              <div className="mt-3 rounded-md bg-muted p-3">
                <p className="text-sm text-foreground">
                  Estimated range: <span className="font-semibold text-primary">
                    ${priceEstimate.lowPrice.toLocaleString()} – ${priceEstimate.highPrice.toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Market value: ${priceEstimate.estimatedPrice.toLocaleString()} ({priceEstimate.confidence} confidence)
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-1" data-testid="button-step3-back">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={!form.price || !form.mileage} className="gap-1" data-testid="button-step3-next">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Review Your Listing</h2>

          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-lg font-bold text-foreground">
                {form.year} {form.make} {form.model} {form.trim}
              </p>
              <p className="text-xl font-bold text-primary mt-1 tabular-nums">${Number(form.price).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Mileage</span>
                <span className="font-medium">{Number(form.mileage).toLocaleString()} mi</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium capitalize">{form.condition}</span>
              </div>
              {form.bodyType && (
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Body Type</span>
                  <span className="font-medium">{form.bodyType}</span>
                </div>
              )}
              {form.transmission && (
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Transmission</span>
                  <span className="font-medium">{form.transmission}</span>
                </div>
              )}
              {form.city && (
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{form.city}, {form.state}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Seller Type</span>
                <span className="font-medium capitalize">{form.sellerType}</span>
              </div>
            </div>

            {form.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{form.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-1" data-testid="button-step4-back">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => submitMut.mutate()}
              disabled={submitMut.isPending}
              className="gap-2"
              data-testid="button-submit-listing"
            >
              {submitMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Listing
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
