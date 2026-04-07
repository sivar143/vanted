import { useRoute } from "wouter";
import { useGetService, useAddToCart } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Star, Clock, CheckCircle2, ShoppingCart, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:id");
  const id = parseInt(params?.id || "0", 10);
  const { toast } = useToast();
  
  const { data: service, isLoading, error } = useGetService(id, {
    query: { enabled: !!id }
  });
  
  const sessionId = getSessionId();
  const { mutate: addToCart, isPending } = useAddToCart({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: "Service has been added to your cart successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add to cart. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  if (isLoading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  if (error || !service) return <div className="min-h-screen pt-24 text-center">Service not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/30 pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <span>Home</span> <span className="text-border">/</span>
          <span>Services</span> <span className="text-border">/</span>
          <span className="text-primary font-medium">{service.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 leading-tight">
              {service.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                <Star className="w-4 h-4 fill-current" />
                {service.rating.toFixed(1)} ({service.reviewCount} reviews)
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-sm">{service.category}</Badge>
              {service.featured && <Badge variant="success" className="px-3 py-1 text-sm">Featured Service</Badge>}
            </div>

            <div className="aspect-[16/9] w-full bg-slate-100 rounded-3xl overflow-hidden border border-border/50 shadow-md">
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-teal-50">
                  <span className="font-display text-6xl font-bold text-primary/20">{service.category}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm">
              <h2 className="text-2xl font-display font-bold mb-4">About This Service</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </div>
            </div>
          </div>

          {/* Sidebar / Checkout Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-xl shadow-slate-200/50 sticky top-28">
              <div className="text-3xl font-bold text-slate-900 mb-6">
                {formatCurrency(service.price)}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">ETA: {service.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Premium Quality Guarantee</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-2xl mb-4"
                onClick={() => addToCart({ data: { sessionId, serviceId: service.id, quantity: 1 } })}
                isLoading={isPending}
                disabled={!service.available}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {service.available ? "Book Now" : "Currently Unavailable"}
              </Button>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Secure, risk-free transaction
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
