import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { getAdminAuthHeaders } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    request: { headers: getAdminAuthHeaders() }
  });

  const cards = [
    { title: "Total Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-100" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
    { title: "Active Services", value: stats?.totalServices || 0, icon: Package, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                <card.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 bg-white rounded-2xl border border-border/60 shadow-sm p-8 text-center h-64 flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-slate-400 mb-2">Analytics Charts</h3>
        <p className="text-slate-400 text-sm">More detailed analytics coming in the next update.</p>
      </div>
    </AdminLayout>
  );
}
