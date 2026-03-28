import { Link, useLocation } from "wouter";
import { ShoppingCart, LayoutDashboard, Menu, X, LogIn, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";
import { getSessionId, getUserInfo, clearUserSession, isUserLoggedIn } from "@/lib/session";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const sessionId = getSessionId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => isUserLoggedIn());
  const userInfo = getUserInfo();

  const { data: cart } = useGetCart({ sessionId }, {
    query: { refetchInterval: 5000 },
  });

  const itemCount = cart?.itemCount || 0;

  const isAdmin = location.startsWith("/admin");
  if (isAdmin) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Explore Services" },
  ];

  function handleLogout() {
    clearUserSession();
    setLoggedIn(false);
    setLocation("/");
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <span className="font-display font-bold text-white text-xl">V</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">Vanted</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left",
                location === link.href ? "text-primary after:scale-x-100" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            Admin
          </Link>

          {loggedIn && userInfo ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <UserCircle className="w-4 h-4 text-primary" />
                {userInfo.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" className="h-9 rounded-xl text-sm">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-9 rounded-xl text-sm">Sign Up</Button>
              </Link>
            </div>
          )}

          <Link href="/cart">
            <Button variant="outline" className="relative h-11 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/30">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-sm animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium p-3 rounded-lg hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-border w-full my-2" />

          {loggedIn && userInfo ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <UserCircle className="w-5 h-5 text-primary" />
                <span className="font-medium text-slate-700">{userInfo.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-destructive font-medium rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12">
                  <LogIn className="w-5 h-5 mr-2" /> Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12">Create Account</Button>
              </Link>
            </div>
          )}

          <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
            <Button className="w-full justify-between h-12 mt-1">
              <span className="flex items-center"><ShoppingCart className="w-5 h-5 mr-2" /> Cart</span>
              {itemCount > 0 && (
                <span className="bg-white/20 text-white px-2 py-1 rounded-md text-xs font-bold">
                  {itemCount} items
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="w-full">
            <Button variant="outline" className="w-full mt-1">Admin Login</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
