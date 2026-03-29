import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import {
  BarChart3, Package, Settings as SettingsIcon, RefreshCw,
  Truck, CheckCircle2, ChevronDown, ChevronUp, Plus,
  Search, Download, Users, IndianRupee, Eye, Edit3,
  AlertTriangle, Phone, MapPin, Palette, Copy
} from "lucide-react";
import { authService } from "@/services/auth.service";

const CATEGORIES = [
  { value: "wedding", label: "Wedding", emoji: "💍" },
  { value: "engagement", label: "Engagement", emoji: "💑" },
  { value: "birthday", label: "Birthday", emoji: "🎂" },
  { value: "religious", label: "Religious", emoji: "🪔" },
  { value: "cultural", label: "Cultural", emoji: "🎭" },
  { value: "housewarming", label: "Housewarming", emoji: "🏠" },
  { value: "baby-shower", label: "Baby Shower", emoji: "👶" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉" },
];

const ORDER_STATUSES = ["pending", "processing", "printing", "packing", "shipping", "delivered"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  printing: "bg-purple-100 text-purple-800 border-purple-200",
  packing: "bg-orange-100 text-orange-800 border-orange-200",
  shipping: "bg-cyan-100 text-cyan-800 border-cyan-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }

export default function AdminDashboard() {
  const navigate = useNavigate();
  // Data
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [designsLoading, setDesignsLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // UI State
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [designViewMode, setDesignViewMode] = useState<"grid" | "list">("grid");
  const [designCategoryFilter, setDesignCategoryFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Toast helper
  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth
  useEffect(() => {
    authService.getCurrentUser()
      .then(user => { if (user.role === "admin") { setIsAdmin(true); fetchAllData(); } else setAuthChecking(false); })
      .catch(() => setAuthChecking(false));
  }, []);

  const fetchAllData = () => { fetchOrders(); fetchDesigns(); fetchSettings(); };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(""); setAuthChecking(true);
    try {
      const data = await authService.adminLogin({ email, password });
      const user = data.user || await authService.getCurrentUser();
      if (user?.role === "admin") { setIsAdmin(true); fetchAllData(); }
      else setLoginError("Not authorized as admin");
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || "Invalid admin credentials");
    } finally { setAuthChecking(false); }
  };

  // Fetchers
  const fetchOrders = async () => {
    setLoading(true);
    try { const res = await api.get("/orders"); setOrders(res.data); }
    catch { console.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  const fetchDesigns = async () => {
    setDesignsLoading(true);
    try { const res = await api.get("/designs/"); setDesigns(res.data); }
    catch { console.error("Failed to fetch designs"); }
    finally { setDesignsLoading(false); }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const keys = ["support_contact", "maintenance_mode", "site_announcement"];
      const data = await Promise.all(keys.map(async k => {
        try { const r = await api.get(`/settings/${k}`); return { key: k, ...r.data }; }
        catch { return { key: k, value: "", description: "Not set" }; }
      }));
      setAppSettings(data);
    } catch { console.error("Failed to fetch settings"); }
    finally { setSettingsLoading(false); }
  };

  // Order actions
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order updated to ${newStatus}`);
    } catch { showToast("Failed to update status", "err"); }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    for (const id of selectedOrders) await updateOrderStatus(id, newStatus);
    setSelectedOrders([]);
    showToast(`${selectedOrders.length} orders updated`);
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Phone", "City", "Design", "Qty", "Amount", "Status", "Payment", "Bride", "Groom", "Venue", "Event Date"];
    const rows = filteredOrders.map(o => [
      o.id, new Date(o.created_at).toLocaleDateString(), o.addresses?.full_name || "",
      o.addresses?.phone || "", o.addresses?.city || "", o.design_slug, o.quantity,
      o.total_amount, o.status, o.payment_status || "", o.customizations?.bride_name || "",
      o.customizations?.groom_name || "", o.customizations?.venue || "", o.customizations?.event_date || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `nymintra-orders-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    showToast("CSV exported successfully");
  };

  // Computed
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (orderStatusFilter !== "all") result = result.filter(o => o.status === orderStatusFilter);
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o =>
        o.id?.toLowerCase().includes(q) || o.addresses?.full_name?.toLowerCase().includes(q) ||
        o.addresses?.phone?.includes(q) || o.design_slug?.toLowerCase().includes(q) ||
        o.customizations?.bride_name?.toLowerCase().includes(q) || o.customizations?.groom_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredDesigns = useMemo(() => {
    if (designCategoryFilter === "all") return designs;
    return designs.filter(d => d.categories?.includes(designCategoryFilter) || d.category === designCategoryFilter);
  }, [designs, designCategoryFilter]);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.total_amount || 0), 0), [orders]);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const customers = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => {
      const key = o.user_id || o.addresses?.phone || o.addresses?.full_name;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { id: key, name: o.addresses?.full_name, phone: o.addresses?.phone,
          email: o.addresses?.email || "", city: o.addresses?.city, state: o.addresses?.state,
          orders: [], totalSpend: 0 });
      }
      const c = map.get(key)!;
      c.orders.push(o); c.totalSpend += o.total_amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  // ─── LOADING / LOGIN SCREENS ───
  if (authChecking && !isAdmin) return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Verifying Access...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-b from-white to-zinc-50/80">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Nymintra Admin</CardTitle>
          <p className="text-sm text-muted-foreground">Invitation Card Management Console</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="admin@nymintra.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            {loginError && <div className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10 font-medium">{loginError}</div>}
            <Button type="submit" className="w-full h-11" disabled={authChecking}>{authChecking ? "Authenticating..." : "Access Dashboard"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // ─── MAIN DASHBOARD ───
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2",
          toast.type === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white")}>
          {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nymintra Admin</h1>
          <p className="text-sm text-muted-foreground">Invitation Card Operations Dashboard</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5"><Truck className="h-4 w-4" />Orders</TabsTrigger>
          <TabsTrigger value="cards" className="gap-1.5"><Package className="h-4 w-4" />Cards</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5"><Users className="h-4 w-4" />Customers</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><SettingsIcon className="h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        {/* ══════ OVERVIEW ══════ */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600", border: "border-l-green-500" },
                { label: "Total Orders", value: orders.length, icon: Truck, color: "text-blue-600", border: "border-l-blue-500" },
                { label: "Avg Order Value", value: `₹${Math.round(avgOrderValue)}`, icon: BarChart3, color: "text-purple-600", border: "border-l-purple-500" },
                { label: "Active Cards", value: designs.filter(d => d.is_active).length, icon: Package, color: "text-primary", border: "border-l-primary" },
              ].map((kpi) => (
                <Card key={kpi.label} className={cn("border-l-4", kpi.border)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{kpi.label}</CardTitle>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </CardHeader>
                  <CardContent><div className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</div></CardContent>
                </Card>
              ))}
            </div>

            {/* Order Pipeline */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Order Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {ORDER_STATUSES.map(s => {
                    const count = orders.filter(o => o.status === s).length;
                    return (
                      <div key={s} className={cn("rounded-xl p-3 text-center border", STATUS_COLORS[s])}>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mt-1">{s}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* Recent Orders */}
              <Card className="lg:col-span-3">
                <CardHeader><CardTitle className="text-sm font-semibold">Recent Orders</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {orders.slice(0, 6).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {o.addresses?.full_name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{o.addresses?.full_name || "Unknown"}</div>
                          <div className="text-[11px] text-muted-foreground">{o.design_slug} · {o.quantity} pcs</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-sm font-bold">₹{o.total_amount}</div>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_COLORS[o.status])}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>}
                </CardContent>
              </Card>

              {/* Low Stock + Category Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-sm font-semibold">Category Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {CATEGORIES.map(cat => {
                    const count = orders.filter(o => {
                      const d = designs.find(dd => dd.slug === o.design_slug);
                      return d?.categories?.includes(cat.value) || d?.category === cat.value;
                    }).length;
                    return count > 0 ? (
                      <div key={cat.value} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                        <span className="text-sm">{cat.emoji} {cat.label}</span>
                        <span className="text-sm font-bold">{count} orders</span>
                      </div>
                    ) : null;
                  }).filter(Boolean)}
                  {designs.filter(d => (d.available_stock || 0) < 500).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock</div>
                      {designs.filter(d => (d.available_stock || 0) < 500).map(d => (
                        <div key={d.id} className="flex justify-between text-sm py-1">
                          <span className="truncate mr-2">{d.name}</span>
                          <span className="font-bold text-destructive shrink-0">{d.available_stock} left</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════ ORDERS ══════ */}
        <TabsContent value="orders">
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-10" placeholder="Search orders by name, phone, ID, design..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{selectedOrders.length} selected</span>
                    {ORDER_STATUSES.map(s => (
                      <Button key={s} variant="outline" size="sm" className="h-7 text-[10px] uppercase" onClick={() => bulkUpdateStatus(s)}>{s}</Button>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5"><Download className="h-3.5 w-3.5" />Export CSV</Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["all", ...ORDER_STATUSES].map(s => (
                <button key={s} onClick={() => setOrderStatusFilter(s)}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize whitespace-nowrap",
                    orderStatusFilter === s ? "bg-primary text-white border-primary" : "bg-white border-zinc-200 hover:border-zinc-300")}
                >{s} {s !== "all" ? `(${orders.filter(o => o.status === s).length})` : `(${orders.length})`}
                </button>
              ))}
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-3 w-8"><input type="checkbox" className="rounded" onChange={e => setSelectedOrders(e.target.checked ? filteredOrders.map(o => o.id) : [])} checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} /></th>
                      <th className="p-3 text-left">Order / Design</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Loading orders...</td></tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No orders found</td></tr>
                    ) : filteredOrders.map(o => (
                      <React.Fragment key={o.id}>
                        <tr className={cn("border-b hover:bg-muted/20 transition-colors cursor-pointer", expandedOrder === o.id && "bg-muted/30")} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                          <td className="p-3" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" className="rounded" checked={selectedOrders.includes(o.id)}
                              onChange={e => setSelectedOrders(e.target.checked ? [...selectedOrders, o.id] : selectedOrders.filter(x => x !== o.id))} />
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-[10px] text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</div>
                            <div className="font-semibold text-xs capitalize">{o.design_slug?.replace(/-/g, " ")}</div>
                            <div className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-xs">{o.addresses?.full_name || "N/A"}</div>
                            <div className="text-[11px] text-muted-foreground">{o.addresses?.city}{o.addresses?.state ? `, ${o.addresses.state}` : ""}</div>
                          </td>
                          <td className="p-3 text-center font-semibold">{o.quantity}</td>
                          <td className="p-3 text-right font-bold">₹{o.total_amount}</td>
                          <td className="p-3" onClick={e => e.stopPropagation()}>
                            <select className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer appearance-none", STATUS_COLORS[o.status])}
                              value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}>
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            {expandedOrder === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </td>
                        </tr>
                        {expandedOrder === o.id && (
                          <tr><td colSpan={7} className="p-0 bg-muted/10 border-b">
                            <div className="p-6 grid md:grid-cols-3 gap-6">
                              {/* Customization */}
                              <div className="bg-white rounded-xl p-4 border shadow-sm">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" />Customization Details</h4>
                                <div className="space-y-2 text-sm">
                                  {[["Bride Name", o.customizations?.bride_name], ["Groom Name", o.customizations?.groom_name],
                                    ["Event Date", o.customizations?.event_date], ["Venue", o.customizations?.venue],
                                    ["Print Color", o.customizations?.print_color], ["Extra Notes", o.customizations?.extra_notes]
                                  ].map(([label, val]) => val ? (
                                    <div key={label as string} className="flex justify-between">
                                      <span className="text-muted-foreground text-xs">{label}</span>
                                      <span className="font-medium text-xs text-right max-w-[60%]">{val as string}</span>
                                    </div>
                                  ) : null)}
                                </div>
                              </div>
                              {/* Shipping */}
                              <div className="bg-white rounded-xl p-4 border shadow-sm">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Shipping Address</h4>
                                <div className="text-sm space-y-1">
                                  <div className="font-semibold">{o.addresses?.full_name}</div>
                                  <div className="text-muted-foreground text-xs leading-relaxed">{o.addresses?.street}<br />{o.addresses?.city}, {o.addresses?.state} - {o.addresses?.zip_code}</div>
                                  <div className="flex items-center gap-1 text-xs mt-2"><Phone className="h-3 w-3" />{o.addresses?.phone}</div>
                                </div>
                              </div>
                              {/* Payment */}
                              <div className="bg-zinc-900 text-white rounded-xl p-4 shadow-sm">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" />Payment Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between"><span className="text-zinc-400 text-xs">Razorpay ID</span><span className="font-mono text-[10px]">{o.razorpay_payment_id || "—"}</span></div>
                                  <div className="flex justify-between"><span className="text-zinc-400 text-xs">Payment</span>
                                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", o.payment_status === "captured" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400")}>{o.payment_status || "pending"}</span>
                                  </div>
                                  <div className="pt-2 border-t border-zinc-700 flex justify-between items-end">
                                    <div><div className="text-[10px] text-zinc-500">Total</div><div className="text-xl font-bold text-primary">₹{o.total_amount}</div></div>
                                    <Button variant="outline" size="sm" className="h-7 text-[10px] border-zinc-600 hover:bg-zinc-800"
                                      onClick={() => { navigator.clipboard.writeText(o.id); showToast("Order ID copied"); }}>
                                      <Copy className="h-3 w-3 mr-1" />Copy ID
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ══════ CARDS ══════ */}
        <TabsContent value="cards">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[{ value: "all", label: "All" }, ...CATEGORIES].map(c => (
                  <button key={c.value} onClick={() => setDesignCategoryFilter(c.value)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors",
                      designCategoryFilter === c.value ? "bg-primary text-white border-primary" : "bg-white border-zinc-200 hover:border-zinc-300")}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant={designViewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setDesignViewMode("grid")}><Package className="h-4 w-4" /></Button>
                <Button variant={designViewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setDesignViewMode("list")}><BarChart3 className="h-4 w-4" /></Button>
                <Button onClick={() => navigate("/admin/designs/upload")} className="gap-1.5"><Plus className="h-4 w-4" />Add Card</Button>
              </div>
            </div>

            {/* Card Grid */}
            {designsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted/40 rounded-xl animate-pulse" />)}</div>
            ) : designViewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDesigns.map(d => (
                  <div key={d.id} className="bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all group">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img src={d.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={d.name} />
                      <div className="absolute top-2 right-2">
                        <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full", d.is_active ? "bg-green-500 text-white" : "bg-zinc-600 text-white")}>{d.is_active ? "Live" : "Draft"}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="flex gap-2 w-full">
                          <Button size="sm" className="flex-1 h-8 text-xs bg-white text-black hover:bg-zinc-100" onClick={() => navigate('/admin/designs/upload?edit=' + d.id)}><Edit3 className="h-3 w-3 mr-1" />Edit</Button>
                          <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={async () => {
                            if (confirm("Deactivate this card?")) { await api.patch(`/designs/${d.id}`, { is_active: !d.is_active }); fetchDesigns(); }
                          }}>{d.is_active ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm truncate">{d.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-primary">₹{d.base_price}</span>
                        <span className="text-[10px] text-muted-foreground">Stock: {d.available_stock}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {(d.categories || [d.category]).filter(Boolean).map((c: string) => (
                          <span key={c} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wider border-b text-muted-foreground">
                      <tr><th className="p-3 text-left">Card</th><th className="p-3">Category</th><th className="p-3">Base</th><th className="p-3">Print</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredDesigns.map(d => (
                        <tr key={d.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 flex items-center gap-3">
                            <img src={d.thumbnail_url} className="w-10 h-12 rounded object-cover" alt="" />
                            <div><div className="font-semibold text-xs">{d.name}</div><div className="text-[10px] text-muted-foreground font-mono">{d.slug}</div></div>
                          </td>
                          <td className="p-3 text-center">{(d.categories || [d.category]).filter(Boolean).join(", ")}</td>
                          <td className="p-3 text-center font-semibold">₹{d.base_price}</td>
                          <td className="p-3 text-center">₹{d.print_price}</td>
                          <td className="p-3 text-center"><span className={cn("font-semibold", (d.available_stock || 0) < 500 ? "text-destructive" : "")}>{d.available_stock}</span></td>
                          <td className="p-3 text-center"><span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", d.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600")}>{d.is_active ? "Live" : "Draft"}</span></td>
                          <td className="p-3 text-center"><Button variant="ghost" size="sm" onClick={() => navigate('/admin/designs/upload?edit=' + d.id)}><Edit3 className="h-3.5 w-3.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ══════ CUSTOMERS ══════ */}
        <TabsContent value="customers">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Customer Directory ({customers.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider border-b text-muted-foreground">
                    <tr><th className="p-3 text-left">Customer</th><th className="p-3">Location</th><th className="p-3 text-center">Orders</th><th className="p-3 text-right">Total Spend</th><th className="p-3 text-left">Recent Order</th></tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} className="border-b hover:bg-muted/20">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{c.name?.charAt(0) || "?"}</div>
                            <div>
                              <div className="font-semibold text-xs">{c.name || "Unknown"}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">{c.phone && <><Phone className="h-3 w-3" />{c.phone}</>}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{c.city}{c.state ? `, ${c.state}` : ""}</td>
                        <td className="p-3 text-center font-semibold">{c.orders.length}</td>
                        <td className="p-3 text-right font-bold text-primary">₹{c.totalSpend.toLocaleString("en-IN")}</td>
                        <td className="p-3"><span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_COLORS[c.orders[0]?.status])}>{c.orders[0]?.status}</span></td>
                      </tr>
                    ))}
                    {customers.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No customer data yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════ SETTINGS ══════ */}
        <TabsContent value="settings">
          <div className="max-w-3xl space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {settingsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-muted/30 rounded-xl animate-pulse" />)
              ) : appSettings.map(s => (
                <Card key={s.key} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Setting</div>
                      <CardTitle className="text-sm capitalize">{s.key.replace(/_/g, " ")}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={async () => {
                      try { await api.put(`/settings/${s.key}`, { value: s.value }); showToast("Setting saved"); }
                      catch { showToast("Failed to save", "err"); }
                    }}>Save</Button>
                  </CardHeader>
                  <CardContent>
                    {typeof s.value === "boolean" ? (
                      <div className="flex items-center gap-3">
                        <Switch checked={s.value} onCheckedChange={v => setAppSettings(appSettings.map(x => x.key === s.key ? { ...x, value: v } : x))} />
                        <span className="text-xs text-muted-foreground">{s.value ? "Enabled" : "Disabled"}</span>
                      </div>
                    ) : (
                      <Textarea className="text-xs" rows={3}
                        value={typeof s.value === "string" ? s.value : JSON.stringify(s.value, null, 2)}
                        onChange={e => setAppSettings(appSettings.map(x => x.key === s.key ? { ...x, value: e.target.value } : x))} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
