import { Link } from "wouter";
import { Star, Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    shortDescription: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    featured?: boolean;
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`}>
      <div className="group h-full bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col cursor-pointer bg-white">
        <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
          {service.featured && (
            <Badge className="absolute top-3 left-3 z-10 shadow-sm" variant="success">Featured</Badge>
          )}
          {service.imageUrl ? (
            <img 
              src={service.imageUrl} 
              alt={service.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-teal-50">
              <span className="font-display font-bold text-4xl text-primary/20">{service.category.substring(0,2).toUpperCase()}</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{service.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-medium text-slate-700">{service.rating.toFixed(1)} <span className="text-slate-400 font-normal">({service.reviewCount})</span></span>
            </div>
          </div>
          
          <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {service.shortDescription}
          </p>
          
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">{formatCurrency(service.price)}</span>
              {service.deliveryTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ETA: {service.deliveryTime}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Book <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
