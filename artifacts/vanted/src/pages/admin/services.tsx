import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListServices, useCreateService, useUpdateService, useDeleteService, getListServicesQueryKey } from "@workspace/api-client-react";
import { getAdminAuthHeaders } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State (Simplified for speed)
  const [formData, setFormData] = useState({
    name: "", description: "", shortDescription: "", price: 0, category: "", imageUrl: "", deliveryTime: "3 days", available: true, featured: false
  });

  const { data } = useListServices({ limit: 100 });
  const services = data?.services || [];

  const headers = getAdminAuthHeaders();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });

  const { mutate: create } = useCreateService({ mutation: { onSuccess: () => { invalidate(); setIsModalOpen(false); } } });
  const { mutate: update } = useUpdateService({ mutation: { onSuccess: () => { invalidate(); setIsModalOpen(false); } } });
  const { mutate: del } = useDeleteService({ mutation: { onSuccess: invalidate } });

  const handleOpenEdit = (service: any) => {
    setFormData({ ...service });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", description: "", shortDescription: "", price: 0, category: "", imageUrl: "", deliveryTime: "3 days", available: true, featured: false });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      update({ id: editingId, data: { ...formData, price: Number(formData.price) }, request: { headers } });
    } else {
      create({ data: { ...formData, price: Number(formData.price) }, request: { headers } });
    }
  };

  return (
    <AdminLayout title="Manage Services">
      <div className="flex justify-between items-center mb-6">
        <Input placeholder="Search services..." className="max-w-xs bg-white" />
        <Button onClick={handleOpenCreate}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-border">
            <tr>
              <th className="p-4 font-medium text-slate-500">Name</th>
              <th className="p-4 font-medium text-slate-500">Category</th>
              <th className="p-4 font-medium text-slate-500">Price</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
              <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4"><Badge variant="outline">{s.category}</Badge></td>
                <td className="p-4 font-medium text-slate-900">{formatCurrency(s.price)}</td>
                <td className="p-4">
                  {s.available ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(s)}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('Delete?')) del({ id: s.id, request: { headers } }) }}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-semibold">Name</label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-xs font-semibold">Category</label><Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-xs font-semibold">Price ($)</label><Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
            <div className="space-y-1"><label className="text-xs font-semibold">Delivery Time</label><Input required value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} /></div>
          </div>
          <div className="space-y-1"><label className="text-xs font-semibold">Short Desc</label><Input required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-semibold">Full Description</label><Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-semibold">Image URL</label><Input value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} /></div>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} /> Available</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} /> Featured</label>
          </div>
          <Button type="submit" className="w-full">Save Service</Button>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
