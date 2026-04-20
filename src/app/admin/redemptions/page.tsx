"use client";

import React, { useState, useEffect, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  ExternalLink,
  Smartphone,
  MapPin,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  X,
  Users
} from "lucide-react";
import { getPendingRedemptions, processRedemption, seedInitialProducts, addRedemptionProduct, uploadProductImage, getRedemptionProducts, updateRedemptionProduct, deleteRedemptionProduct } from "@/app/actions/redemptions";
import { cn } from "@/lib/utils";

export default function AdminRedemptionsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"pending" | "processed" | "inventory">("pending");
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    pointsCost: 0,
    type: "PRODUCT",
    imageUrl: "",
    imageFile: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [reqRes, prodRes] = await Promise.all([
      getPendingRedemptions(),
      getRedemptionProducts()
    ]);
    if (reqRes.success) setRequests(reqRes.requests || []);
    if (prodRes.success) setProducts(prodRes.products || []);
    setLoading(false);
  };
  
  useEffect(() => { fetchData(); }, []);

  const handleProcess = (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    startTransition(async () => {
      const res = await processRedemption(id, status);
      if (res.success) fetchData();
      else alert(res.error);
    });
  };

  const handleSeed = () => {
    if (!confirm("Seed initial products?")) return;
    startTransition(async () => {
      const res = await seedInitialProducts();
      if (res.success) alert("Products seeded!");
      else alert(res.error);
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.pointsCost <= 0) {
      alert("Name and valid points cost are required.");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = newProduct.imageUrl;

    if (newProduct.imageFile) {
      const formData = new FormData();
      formData.append("file", newProduct.imageFile);
      const uploadRes = await uploadProductImage(formData);
      if (uploadRes.success) {
        finalImageUrl = uploadRes.url || "";
      } else {
        alert("Image upload failed: " + uploadRes.error);
        setIsUploading(false);
        return;
      }
    }

    if (editingProduct) {
      const res = await updateRedemptionProduct(editingProduct.id, {
        ...newProduct,
        imageUrl: finalImageUrl
      });
      if (res.success) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        setNewProduct({ name: "", description: "", pointsCost: 0, type: "PRODUCT", imageUrl: "", imageFile: null });
        alert("Product updated successfully!");
        fetchData();
      } else {
        alert(res.error);
      }
    } else {
      const res = await addRedemptionProduct({
        ...newProduct,
        imageUrl: finalImageUrl
      });
  
      if (res.success) {
        setIsAddModalOpen(false);
        setNewProduct({ name: "", description: "", pointsCost: 0, type: "PRODUCT", imageUrl: "", imageFile: null });
        alert("Product added successfully!");
        fetchData();
      } else {
        alert(res.error);
      }
    }
    setIsUploading(false);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || "",
      pointsCost: product.pointsCost,
      type: product.type,
      imageUrl: product.imageUrl || "",
      imageFile: null
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const res = await deleteRedemptionProduct(id);
    if (res.success) {
      alert("Product deleted.");
      fetchData();
    } else {
      alert(res.error);
    }
  };

  const filteredRequests = requests.filter(r => 
    activeTab === "pending" ? r.status === "PENDING" : r.status !== "PENDING"
  );

  return (
    <div className="space-y-10 animate-vapor">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
            Redemption <span className="text-primary tracking-normal not-italic">Queue</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
            Audit and authorize point extractions. Approved requests will trigger automatic point deductions.
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleSeed}
             className="px-6 py-3 bg-white/5 hover:bg-white/10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
           >
             <RefreshCw size={14} /> Seed Products
           </button>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-6 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
           >
             <Plus size={14} /> Add Product
           </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="max-w-xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} className="text-on-surface-variant hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                  placeholder="e.g. 100 PHP GCash"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Points Cost</label>
                <input 
                  type="number" 
                  value={newProduct.pointsCost}
                  onChange={e => setNewProduct({...newProduct, pointsCost: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary outline-none resize-none"
                  rows={3}
                  placeholder="Details about this reward..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Type</label>
                  <select 
                    value={newProduct.type}
                    onChange={e => setNewProduct({...newProduct, type: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                  >
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="GCASH">GCASH</option>
                    <option value="RAFFLE_PRIZE">RAFFLE_PRIZE</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Upload Image</label>
                   <input 
                    type="file" 
                    onChange={e => setNewProduct({...newProduct, imageFile: e.target.files?.[0] || null})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold file:bg-primary/10 file:border-0 file:text-primary file:rounded-lg file:px-2 file:py-1 file:mr-2"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Or Image URL</label>
                <input 
                  type="text" 
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                  placeholder="https://i.postimg.cc/..."
                />
              </div>
            </div>

            <button 
              onClick={handleAddProduct}
              disabled={isUploading}
              className="w-full py-4 bg-primary text-background rounded-xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUploading ? "Uploading..." : editingProduct ? "Update Product Details" : "Save Product Prototype"}
            </button>
          </GlassCard>
        </div>
      )}

      <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "pending" ? "bg-primary text-slate-950 shadow-lg" : "text-on-surface-variant hover:text-white"
          )}
        >
          Pending Audit ({requests.filter(r => r.status === "PENDING").length})
        </button>
        <button 
          onClick={() => setActiveTab("processed")}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "processed" ? "bg-primary text-slate-950 shadow-lg" : "text-on-surface-variant hover:text-white"
          )}
        >
          Processed History
        </button>
        <button 
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "inventory" ? "bg-primary text-slate-950 shadow-lg" : "text-on-surface-variant hover:text-white"
          )}
        >
          Inventory Management ({products.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeTab === "inventory" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <GlassCard key={product.id} className="p-0 overflow-hidden flex flex-col hover:border-primary/20 transition-all">
                  <div className="aspect-video relative bg-slate-900">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/10">
                         <ShoppingBag size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                       <button onClick={() => handleEditProduct(product)} className="p-2 bg-slate-950/80 rounded-lg text-primary hover:bg-primary hover:text-slate-950 transition-all"><Save size={14} /></button>
                       <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-slate-950/80 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                       <h4 className="text-lg font-black text-on-surface uppercase tracking-tight">{product.name}</h4>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{product.pointsCost.toLocaleString()} PTS • {product.type}</p>
                       <p className="text-xs text-on-surface-variant mt-3 line-clamp-2 opacity-60 font-medium">{product.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center glass-card border-dashed">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-black text-on-surface-variant uppercase tracking-widest">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <GlassCard key={req.id} className="p-0 overflow-hidden border-white/5 hover:border-white/10 transition-all">
                {/* ... existing request card content ... */}
                <div className="p-8 flex flex-col lg:flex-row gap-8">
                   <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                               <ShoppingBag size={24} />
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">{req.product?.name || "Unknown Item"}</h3>
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Cost: {req.product?.pointsCost.toLocaleString()} PTS</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Requested On</p>
                            <p className="text-sm font-bold text-on-surface">{new Date(req.createdAt).toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                         <div>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Agent Credentials</p>
                            <div className="space-y-2">
                               <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                                  <Smartphone size={14} className="text-primary" /> {req.verificationDetails?.phone || "No Phone"}
                               </p>
                               <p className="text-sm font-medium text-white flex items-center gap-2">
                                  <Users size={14} className="text-primary" /> {req.verificationDetails?.username || "No Username"}
                               </p>
                               <p className="text-sm font-medium text-on-surface-variant">
                                  {req.user?.name} ({req.user?.username || req.user?.email})
                               </p>
                               {req.verificationDetails?.email && (
                                  <p className="text-xs text-on-surface-variant italic">{req.verificationDetails?.email}</p>
                                )}
                            </div>
                         </div>
                         <div className="space-y-4">
                            {req.product?.type === "PRODUCT" && (
                               <div>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Shipping Matrix</p>
                                  <p className="text-sm font-medium text-on-surface-variant flex items-start gap-2 leading-relaxed italic">
                                     <MapPin size={14} className="text-primary shrink-0 mt-1" /> {req.verificationDetails?.address || "No Address Provided"}
                                  </p>
                               </div>
                            )}
                            {req.verificationDetails?.instructions && (
                               <div>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Instructions</p>
                                  <p className="text-xs font-medium text-on-surface-variant opacity-60 leading-relaxed italic">
                                     "{req.verificationDetails?.instructions}"
                                  </p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className="lg:w-64 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                      {req.status === "PENDING" ? (
                        <>
                           <button 
                             onClick={() => handleProcess(req.id, "APPROVED")}
                             disabled={isPending}
                             className="w-full py-4 bg-emerald-500 text-background rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                           >
                              <CheckCircle2 size={16} /> Approve & Deduct
                           </button>
                           <button 
                             onClick={() => handleProcess(req.id, "REJECTED")}
                             disabled={isPending}
                             className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-background rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-red-500/20"
                           >
                              <XCircle size={16} /> Reject Protocol
                           </button>
                        </>
                      ) : (
                        <div className="text-center space-y-2">
                           <div className={cn(
                             "w-12 h-12 rounded-full mx-auto flex items-center justify-center",
                             req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                           )}>
                              {req.status === "APPROVED" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                           </div>
                           <p className={cn("text-xs font-black uppercase tracking-widest", req.status === "APPROVED" ? "text-emerald-400" : "text-red-400")}>
                             {req.status}
                           </p>
                        </div>
                      )}
                   </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
