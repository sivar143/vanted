import { useRoute, Link } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:id");
  const orderId = params?.id;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 md:p-16 rounded-3xl border border-border shadow-xl max-w-xl w-full text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-lg text-slate-600 mb-2">Thank you for your order.</p>
        <p className="text-sm text-slate-500 mb-10">Order ID: <span className="font-mono font-medium text-slate-900">#{orderId}</span></p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/services">
            <Button size="lg" className="w-full h-12 rounded-xl">
              Continue Browsing
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full h-12 rounded-xl">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
