import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, Save, ArrowLeft, Layers, MapPin, DollarSign, Zap, Cpu, Settings, Ruler } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: '', 
    sku: '', 
    productCode: '', 
    brand: 'Wipro', 
    category: 'Lighting LED', 
    
    // 2. Pricing
    basePrice: '', 
    mrp: '', 
    
    // 3. Inventory
    stockCount: '',
    zone: '', rack: '', shelf: '',
    
    // 4. Specs - Lighting (Restored All Fields)
    wattage: '', 
    lumens: '', 
    cct: '6500K', 
    cutoutInch: '', 
    beamAngle: '', 
    ipRating: '', 
    driverType: '', 
    diameterMm: '', 
    heightMm: '', 
    driverAmp: '',       // ✅ NEW
    mountingType: 'None', // ✅ NEW
    
    // 5. Specs - Switchgear
    modules: '', 
    ampere: '', 
    pins: '', 
    material: '',
    indicator: false,
    boxType: ''
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      sku: formData.sku || formData.productCode,
      productCode: formData.productCode,
      brand: formData.brand,
      category: formData.category,
      basePrice: Number(formData.basePrice),
      mrp: Number(formData.mrp),
      inventory: {
        stockCount: Number(formData.stockCount),
        location: { 
          zone: formData.zone, 
          rack: formData.rack, 
          shelf: formData.shelf 
        }
      },
      specifications: {
        // Lighting Specs
        ...(formData.category === 'Lighting LED' ? {
            wattage: formData.wattage,
            lumens: formData.lumens,
            cct: formData.cct,
            cutoutInch: Number(formData.cutoutInch),
            beamAngle: formData.beamAngle,
            ipRating: formData.ipRating,
            driverType: formData.driverType,
            diameterMm: Number(formData.diameterMm),
            heightMm: Number(formData.heightMm),
            driverAmp: formData.driverAmp,       // ✅ Sent to Backend
            mountingType: formData.mountingType  // ✅ Sent to Backend
        } : {}),
        
        // Switchgear Specs
        ...(formData.category === 'Switch' ? {
            modules: formData.modules,
            ampere: formData.ampere,
            pins: Number(formData.pins),
            material: formData.material,
            indicator: formData.indicator,
            boxType: formData.boxType
        } : {})
      }
    };

    try {
      await api.post('/products', payload);
      toast.success("Product Added Successfully!");
      navigate('/inventory');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex justify-center">
      <div className="w-full max-w-6xl">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 hover:text-white transition">
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-2xl font-black tracking-tight text-white">Add New Product</h1>
             <p className="text-slate-500 text-sm font-medium">Inventory Entry Form</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. IDENTITY CARD */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                <Layers size={14}/> Product Identity
              </h3>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="label">Product Name *</label>
                  <input type="text" name="name" required placeholder="e.g. 9W LED Downlight" onChange={handleChange} className="input-dark"/>
                </div>
                
                <div>
                  <label className="label">Catalog Number</label>
                  <input type="text" name="productCode" placeholder="WP-9W-DL" onChange={handleChange} className="input-dark font-mono text-yellow-500 uppercase"/>
                </div>

                <div>
                   <label className="label">SKU (Auto/Manual) *</label>
                   <input type="text" name="sku" required placeholder="SKU123" onChange={handleChange} className="input-dark font-mono text-slate-400"/>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select name="category" onChange={handleChange} className="input-dark text-blue-400 font-bold">
                    <option value="Lighting LED">Lighting LED</option>
                    <option value="Switch">Switch</option>
                    <option value="Accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="label">Brand</label>
                  <select name="brand" onChange={handleChange} className="input-dark">
                    <option value="Wipro">Wipro</option>
                    <option value="Teso">Teso</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. SPECIFICATIONS CARD (Dynamic) */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
                {formData.category === 'Lighting LED' ? <Zap size={14}/> : formData.category === 'Switch' ? <Cpu size={14}/> : <Settings size={14}/>}
                Technical Specifications
              </h3>

              {/* LIGHTING FIELDS */}
              {formData.category === 'Lighting LED' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {/* Row 1: Electrical */}
                  <div><label className="label">Wattage</label><input name="wattage" placeholder="9W" onChange={handleChange} className="input-dark"/></div>
                  <div><label className="label">Lumens</label><input name="lumens" placeholder="900lm" onChange={handleChange} className="input-dark"/></div>
                  <div><label className="label text-amber-400">Driver AMP</label><input name="driverAmp" placeholder="0.5A" onChange={handleChange} className="input-dark border-amber-500/20"/></div>
                  <div><label className="label">Driver Type</label><input name="driverType" placeholder="Internal" onChange={handleChange} className="input-dark"/></div>

                  {/* Row 2: Optical/Color */}
                  <div className="col-span-2">
                     <label className="label">CCT (Color)</label>
                     <select name="cct" onChange={handleChange} className="input-dark">
                        <option value="6500K">6500K (Cool White)</option>
                        <option value="4000K">4000K (Natural White)</option>
                        <option value="3000K">3000K (Warm White)</option>
                        <option value="RGB">RGB</option>
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="label text-amber-400">Mounting Type</label>
                     <select name="mountingType" onChange={handleChange} className="input-dark font-bold">
                        <option value="None">None / Default</option> {/* ✅ Added None */}
                        <option value="Concealed">Concealed (Inside Ceiling)</option>
                        <option value="Open">Open / Surface</option>
                     </select>
                  </div>

                  {/* Row 3: Dimensions */}
                  <div><label className="label">Cutout (Inch)</label><input type="number" name="cutoutInch" placeholder="4" onChange={handleChange} className="input-dark"/></div>
                  <div><label className="label">Dia (mm)</label><input type="number" name="diameterMm" placeholder="100" onChange={handleChange} className="input-dark"/></div>
                  <div><label className="label">Height (mm)</label><input type="number" name="heightMm" placeholder="50" onChange={handleChange} className="input-dark"/></div>
                  <div><label className="label">Beam Angle</label><input name="beamAngle" placeholder="120°" onChange={handleChange} className="input-dark"/></div>
                  
                  {/* Row 4: Protection */}
                  <div><label className="label">IP Rating</label><input name="ipRating" placeholder="IP20" onChange={handleChange} className="input-dark"/></div>
                </div>
              )}

              {/* SWITCH FIELDS */}
              {formData.category === 'Switch' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                   <div><label className="label">Modules</label><input name="modules" placeholder="2M" onChange={handleChange} className="input-dark"/></div>
                   <div><label className="label">Amperes</label><input name="ampere" placeholder="6A" onChange={handleChange} className="input-dark"/></div>
                   <div><label className="label">Pins</label><input type="number" name="pins" placeholder="3" onChange={handleChange} className="input-dark"/></div>
                   <div><label className="label">Box Type</label><input name="boxType" placeholder="Concealed" onChange={handleChange} className="input-dark"/></div>
                   <div className="col-span-2"><label className="label">Material</label><input name="material" placeholder="Polycarb" onChange={handleChange} className="input-dark"/></div>
                   
                   <div className="col-span-2 flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <input type="checkbox" name="indicator" checked={formData.indicator} onChange={handleChange} className="w-5 h-5 accent-blue-500"/>
                      <label className="text-sm font-bold text-slate-400">Has LED Indicator?</label>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Stock & Price */}
          <div className="space-y-6">
            
            {/* 3. LOCATION & STOCK */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                <MapPin size={14}/> Warehouse Location
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <input name="zone" placeholder="Zone" onChange={handleChange} className="input-dark text-center uppercase"/>
                <input name="rack" placeholder="Rack" onChange={handleChange} className="input-dark text-center uppercase"/>
                <input name="shelf" placeholder="Shelf" onChange={handleChange} className="input-dark text-center uppercase"/>
              </div>

              <div>
                <label className="label">Initial Stock Qty</label>
                <input type="number" name="stockCount" placeholder="0" onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl text-center text-2xl font-black text-white outline-none focus:border-emerald-500"/>
              </div>
            </div>

            {/* 4. PRICING */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
               <h3 className="text-[10px] font-black uppercase text-purple-500 tracking-widest flex items-center gap-2">
                <DollarSign size={14}/> Pricing
              </h3>
              
              <div>
                <label className="label">MRP (Retail Price)</label>
                <input type="number" name="mrp" placeholder="0.00" onChange={handleChange} className="input-dark text-right font-bold"/>
              </div>

              <div>
                <label className="label text-emerald-400">Wholesale Price (Base)</label>
                <input type="number" name="basePrice" placeholder="0.00" onChange={handleChange} className="input-dark text-right font-black text-emerald-400 text-xl border-emerald-900/50 focus:border-emerald-500"/>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              {loading ? "SAVING..." : <><Save className="inline mr-2" size={20}/> SAVE PRODUCT</>}
            </button>

            {/* Helper Styles */}
            <style>{`
              .label { display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
              .input-dark { width: 100%; padding: 0.75rem; background: #020617; border: 1px solid #1e293b; border-radius: 0.75rem; outline: none; font-weight: 600; color: #e2e8f0; transition: border-color 0.2s; }
              .input-dark:focus { border-color: #3b82f6; background: #0f172a; }
            `}</style>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;