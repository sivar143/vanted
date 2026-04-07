import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock, MapPin, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "Name must be at least 3 characters"),
  customerEmail: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  cardNumber: z.string().min(16, "Invalid card").optional(),
  cardExpiry: z.string().min(5, "MM/YY").optional(),
  cardCvv: z.string().min(3, "CVV required").optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const sessionId = getSessionId();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart } = useGetCart({ sessionId });
  
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "credit_card", notes: "" },
  });

  const { mutate: createOrder, isPending } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        // Clear cart cache
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        setLocation(`/order-success/${data.id}`);
      },
      onError: () => {
        toast({ title: "Checkout Failed", description: "Please try again.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrder({
      data: {
        sessionId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        address: data.address,
        notes: data.notes ?? "",
        paymentMethod: data.paymentMethod as "credit_card" | "debit_card" | "paypal" | "bank_transfer",
        cardNumber: data.cardNumber ?? null,
        cardExpiry: data.cardExpiry ?? null,
        cardCvv: data.cardCvv ?? null,
      },
    });
  };

  if (!cart || cart.items.length === 0) {
    return <div className="min-h-screen pt-24 text-center">Cart is empty. Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Confirm Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input {...form.register("customerName")} placeholder="Your name" />
                    {form.formState.errors.customerName && <p className="text-xs text-destructive mt-1">{form.formState.errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input type="email" {...form.register("customerEmail")} placeholder="you@example.com" />
                    {form.formState.errors.customerEmail && <p className="text-xs text-destructive mt-1">{form.formState.errors.customerEmail.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" /> Service Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Address</label>
                    <textarea
                      {...form.register("address")}
                      rows={3}
                      placeholder="Enter your full address where the service is needed"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                    {form.formState.errors.address && <p className="text-xs text-destructive mt-1">{form.formState.errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-1 block">
                      <FileText className="w-4 h-4 text-muted-foreground" /> Notes
                      <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                    </label>
                    <textarea
                      {...form.register("notes")}
                      rows={2}
                      placeholder="Any special instructions or requirements"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary" /> Payment Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Number</label>
                    <Input {...form.register("cardNumber")} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                      <Input {...form.register("cardExpiry")} placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">CVV</label>
                      <Input {...form.register("cardCvv")} placeholder="123" />
                    </div>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                    <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">Payments are secure and encrypted. This is a demo app, do not use real card details.</p>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-2xl" isLoading={isPending}>
                Confirm Booking — {formatCurrency(cart.total)}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-8 rounded-3xl border border-border shadow-xl sticky top-28">
              <h3 className="text-xl font-bold mb-6">Booking Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-slate-900">{item.service.name}</p>
                      <p className="text-muted-foreground">
                        {item.service.deliveryTime && <span className="mr-2">{item.service.deliveryTime}</span>}
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">{formatCurrency(item.service.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border my-6" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
