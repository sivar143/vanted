import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveCartItem, useUpdateCartItem } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCartQueryKey } from "@workspace/api-client-react";

export default function Cart() {
  const sessionId = getSessionId();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart({ sessionId });
  
  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });

  const { mutate: removeItem } = useRemoveCartItem({ mutation: { onSuccess: invalidateCart } });
  const { mutate: updateItem } = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });

  if (isLoading) return <div className="min-h-screen pt-24 text-center">Loading cart...</div>;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">Your Cart</h1>

        {isEmpty ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-border shadow-sm">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any services yet.</p>
            <Link href="/services">
              <Button size="lg" className="rounded-xl px-8 h-14">Start Browsing Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-32 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.service.imageUrl ? (
                      <img src={item.service.imageUrl} alt={item.service.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Img</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.service.name}</h3>
                      <p className="font-bold text-lg text-primary ml-4 shrink-0">{formatCurrency(item.service.price)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{item.service.shortDescription}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 bg-slate-50 border border-border rounded-lg p-1">
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateItem({ itemId: item.id, data: { quantity: item.quantity - 1 } })
                            } else {
                              removeItem({ itemId: item.id })
                            }
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-4 text-center">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                          onClick={() => updateItem({ itemId: item.id, data: { quantity: item.quantity + 1 } })}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem({ itemId: item.id })}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl border border-border shadow-xl sticky top-28">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Processing Fee</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="h-px bg-border my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cart.total)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-xl text-base"
                  onClick={() => setLocation("/checkout")}
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
