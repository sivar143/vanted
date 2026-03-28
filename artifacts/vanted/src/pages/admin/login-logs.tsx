import { useState } from "react";
import { useGetLoginLogs } from "@workspace/api-client-react";
import { getAdminAuthHeaders } from "@/lib/session";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Shield, User, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "all" | "admin" | "user";

export default function AdminLoginLogs() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetLoginLogs(
    {
      ...(filter !== "all" ? { type: filter as "admin" | "user" } : {}),
      page,
      limit: 20,
    },
    {
      request: { headers: getAdminAuthHeaders() },
      query: { refetchInterval: 10000 },
    }
  );

  function handleFilter(f: FilterType) {
    setFilter(f);
    setPage(1);
  }

  return (
    <AdminLayout title="Login Records">
    <div className="space-y-6">
      <div>
        <p className="text-slate-500">All admin and user login attempts are recorded here.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "admin", "user"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-slate-600 hover:bg-slate-50"
            )}
          >
            {f === "all" ? "All Logins" : f === "admin" ? "Admin" : "Users"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Identifier</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">IP Address</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : !data?.logs?.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No login records found.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        log.type === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-blue-100 text-blue-700"
                      )}>
                        {log.type === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {log.type === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{log.identifier}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50">
            <span className="text-sm text-slate-500">
              Page {data.page} of {data.totalPages} &mdash; {data.total} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
