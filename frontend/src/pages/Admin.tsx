import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  BarChart3, Package, Truck, IndianRupee, AlertTriangle
} from "lucide-react";

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
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchDesigns()]).finally(() => setLoading(false));
  }, []);

  const fetchOrders = async () => {
    try { const res = await api.get("/orders"); setOrders(res.data); }
    catch (err) { console.error("Orders fail", err); }
  };

  const fetchDesigns = async () => {
    try { const res = await api.get("/designs"); setDesigns(res.data); }
    catch (err) { console.error("Designs fail", err); }
  };

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total_amount || 0), 0), [orders]);
  const avgOrderValue = useMemo(() => orders.length ? totalRevenue / orders.length : 0, [orders, totalRevenue]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back. Here's a snapshot of your business today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600", border: "border-l-green-500" },
          { label: "Total Orders", value: orders.length, icon: Truck, color: "text-blue-600", border: "border-l-blue-500" },
          { label: "Avg Order Value", value: `₹${Math.round(avgOrderValue)}`, icon: BarChart3, color: "text-purple-600", border: "border-l-purple-500" },
          { label: "Active Cards", value: designs.filter(d => d.is_active).length, icon: Package, color: "text-primary", border: "border-l-primary" },
        ].map((kpi) => (
          <Card key={kpi.label} className={cn("border-l-4 shadow-sm hover:shadow-md transition-shadow", kpi.border)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </CardHeader>
            <CardContent><div className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Order Pipeline */}
      <Card className="shadow-sm border-muted/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Delivery Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ORDER_STATUSES.map(s => {
              const count = orders.filter(o => o.status === s).length;
              return (
                <div key={s} className={cn("rounded-xl p-4 text-center border transition-all hover:bg-zinc-50/50", STATUS_COLORS[s])}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">{s}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Recent Orders */}
        <Card className="lg:col-span-3 shadow-sm border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-sm font-semibold">Latest Orders</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => navigate('/admin/orders')}>View All Orders</Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-xl hover:bg-muted/40 transition-all cursor-pointer border border-transparent hover:border-muted-foreground/10" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                    {o.addresses?.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate text-foreground">{o.addresses?.full_name || "Unknown"}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{o.design_slug} · {o.quantity} units</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-sm font-black text-primary">₹{o.total_amount}</div>
                  <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter mt-1 block", STATUS_COLORS[o.status])}>{o.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground italic">No orders received yet today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown & Low Stock */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-muted/60">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-semibold">Performance by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {CATEGORIES.map(cat => {
                const count = orders.filter(o => {
                  const d = designs.find(dd => dd.slug === o.design_slug);
                  return d?.categories?.includes(cat.value) || d?.category === cat.value;
                }).length;
                return count > 0 ? (
                  <div key={cat.value} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-sm flex items-center gap-2">{cat.emoji} <span className="font-medium">{cat.label}</span></span>
                    <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded-md">{count} orders</span>
                  </div>
                ) : null;
              }).filter(Boolean)}
              {!orders.some(o => designs.find(d => d.slug === o.design_slug)) && 
                <p className="text-xs text-muted-foreground text-center py-4">Waiting for data...</p>
              }
            </CardContent>
          </Card>

          {/* Low Stock Warning */}
          {designs.filter(d => (d.available_stock || 0) < 500).length > 0 && (
            <Card className="shadow-sm border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3 border-b border-destructive/10">
                <CardTitle className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Inventory Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {designs.filter(d => (d.available_stock || 0) < 500).slice(0, 4).map(d => (
                  <div key={d.id} className="flex justify-between items-center text-xs py-1">
                    <span className="truncate mr-4 font-medium text-destructive/80">{d.name}</span>
                    <span className="font-black text-destructive shrink-0 bg-white px-2 py-0.5 rounded border border-destructive/20 shadow-sm">{d.available_stock}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full text-[10px] h-8 text-destructive hover:bg-destructive/10 font-bold" onClick={() => navigate('/admin/designs')}>
                    Open Card Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
