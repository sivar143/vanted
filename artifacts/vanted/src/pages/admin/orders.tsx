import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders } from "@workspace/api-client-react";
import { getAdminAuthHeaders } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminOrders() {
  const { data, isLoading } = useListOrders({
    request: { headers: getAdminAuthHeaders() }
  });

  const orders = data?.orders || [];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'processing': return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
      case 'pending': return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <AdminLayout title="Orders">
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-border">
            <tr>
              <th className="p-4 font-medium text-slate-500">Order ID</th>
              <th className="p-4 font-medium text-slate-500">Customer</th>
              <th className="p-4 font-medium text-slate-500">Date</th>
              <th className="p-4 font-medium text-slate-500">Total</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    {order.address && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{order.address}</div>}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                  <td className="p-4 font-bold text-slate-900">{formatCurrency(order.total)}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
