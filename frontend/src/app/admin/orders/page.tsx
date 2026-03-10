import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
    const mockOrders = [
        { id: "NYM-20260315-001", customer: "Rahul Sharma", date: "Today", status: "Pending Review", amount: "₹4,500" },
        { id: "NYM-20260315-002", customer: "Priya Patel", date: "Today", status: "Printing", amount: "₹8,200" },
        { id: "NYM-20260314-045", customer: "Amit Kumar", date: "Yesterday", status: "Shipped", amount: "₹2,100" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Review print proofs, handle approvals, and update tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-foreground">
                        {mockOrders.map((order, i) => (
                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{order.id}</td>
                                <td className="px-6 py-4">{order.customer}</td>
                                <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                                <td className="px-6 py-4">{order.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${order.status === "Pending Review" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                            order.status === "Printing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        View & Approve
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
