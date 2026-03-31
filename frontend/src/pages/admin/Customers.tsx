import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Users, Phone } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  printing: "bg-purple-100 text-purple-800 border-purple-200",
  packing: "bg-orange-100 text-orange-800 border-orange-200",
  shipping: "bg-cyan-100 text-cyan-800 border-cyan-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders for customers view", err);
    } finally {
      setLoading(false);
    }
  };

  const customers = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => {
      const key = o.user_id || o.addresses?.phone || o.addresses?.full_name;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { 
          id: key, 
          name: o.addresses?.full_name, 
          phone: o.addresses?.phone,
          email: o.addresses?.email || "", 
          city: o.addresses?.city, 
          state: o.addresses?.state,
          orders: [], 
          totalSpend: 0 
        });
      }
      const c = map.get(key)!;
      c.orders.push(o); 
      c.totalSpend += o.total_amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  if (loading) {
    return <div className="py-24 text-center">Loading customer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Customer Directory</h1>
        <p className="text-muted-foreground mt-1">Manage and view all customers and their order history.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider border-b text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-center">Orders</th>
                  <th className="p-3 text-right">Total Spend</th>
                  <th className="p-3 text-left">Recent Order Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {c.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-xs">{c.name || "Unknown"}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            {c.phone && <><Phone className="h-3 w-3" />{c.phone}</>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center text-xs text-muted-foreground">
                      {c.city}{c.state ? `, ${c.state}` : ""}
                    </td>
                    <td className="p-3 text-center font-semibold">{c.orders.length}</td>
                    <td className="p-3 text-right font-bold text-primary">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.orders[0]?.status] || "bg-zinc-100"}`}>
                        {c.orders[0]?.status || "unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">No customer data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
