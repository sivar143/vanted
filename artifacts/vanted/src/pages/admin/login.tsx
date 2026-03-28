import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate: login, isPending } = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("admin-token", data.token);
        setLocation("/admin/dashboard");
      },
      onError: () => {
        setError("Invalid credentials");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login({ data: { username, password } });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-white text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Admin Access</h1>
          <p className="text-slate-500 mt-2">Sign in to manage Vanted marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                className="pl-12 h-12" 
                placeholder="admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                type="password"
                className="pl-12 h-12" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg rounded-xl" isLoading={isPending}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
