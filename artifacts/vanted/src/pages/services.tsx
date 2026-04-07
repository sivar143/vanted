import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { useListServices, useListCategories } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function Services() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const initialCategory = searchParams.get("category") || "";
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  
  const { data, isLoading } = useListServices({ 
    search: search || undefined, 
    category: category || undefined,
    limit: 12
  });
  
  const { data: categoriesData } = useListCategories();
  const categories = categoriesData?.categories || [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header & Search */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">Explore Services</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="What service are you looking for?" 
                className="pl-12 h-14 rounded-2xl text-base shadow-sm border-border/80 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-6 rounded-2xl bg-white hidden md:flex">
              <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Categories */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm sticky top-28">
              <h3 className="font-semibold text-lg mb-4 flex items-center"><Filter className="w-4 h-4 mr-2" /> Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === "" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[400px] bg-slate-200/50 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : data?.services.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-border/50">
                <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="Empty" className="w-48 h-48 mx-auto mb-6 opacity-80" />
                <h3 className="text-xl font-bold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or category filter.</p>
                <Button onClick={() => { setSearch(""); setCategory(""); }}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data?.services.map((service, i) => (
                  <motion.div 
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Pagination placeholder - Assuming API supports it but keeping UI simple */}
            {data && data.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" className="rounded-xl">Load More</Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
