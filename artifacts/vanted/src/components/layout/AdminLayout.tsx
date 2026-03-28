import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getAdminToken } from "@/lib/session";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!getAdminToken() && location !== "/admin") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setLocation("/admin");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/services", label: "Services", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-white">V</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary-foreground transition-colors">Vanted Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "hover:bg-slate-800 hover:text-white"
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium w-full hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-border flex items-center px-8 shrink-0">
          <h1 className="text-2xl font-display font-bold text-slate-900">{title}</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
