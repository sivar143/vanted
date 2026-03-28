import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { setUserSession } from "@/lib/session";

export default function Login() {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate: login, isPending } = useUserLogin({
    mutation: {
      onSuccess: (data) => {
        setUserSession(data.token, {
          userId: data.userId,
          email: data.email,
          username: data.username,
        });
        setLocation("/");
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg ?? "Invalid credentials. Please try again.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login({ data: { identifier, password } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <Link href="/">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4 cursor-pointer">
              <span className="font-display font-bold text-white text-2xl">V</span>
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to your Vanted account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email or Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                className="pl-12 h-12"
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base rounded-xl" isLoading={isPending}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
