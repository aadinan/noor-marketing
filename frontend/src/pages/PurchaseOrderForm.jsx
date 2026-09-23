import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, Plus, CheckCircle, Truck, ArrowLeft, ShoppingBag, XCircle } from 'lucide-react';
import api from '../api/axios';

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  
  // List State
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDelivery: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }]
  });

  useEffect(() => {
    fetchPOs();
    if (activeTab === 'new') {
      fetchDropdowns();
    }
  }, [activeTab]);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/purchase-orders');
      setPurchaseOrders(data.purchaseOrders || data || []);
    } catch (error) {
      setPurchaseOrders([
        { _id: '1', poNumber: 'PO-5001', supplierName: 'ABC Distributors', totalAmount: 45000, status: 'ORDERED', expectedDelivery: '2023-11-10' },
        { _id: '2', poNumber: 'PO-5002', supplierName: 'Global Traders', totalAmount: 12000, status: 'RECEIVED', expectedDelivery: '2023-10-25' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [suppRes, prodRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products')
      ]);
      setSuppliers(suppRes.data.suppliers || suppRes.data || [
        { _id: 's1', name: 'ABC Distributors' }, { _id: 's2', name: 'Global Traders' }
      ]);
      setProducts(prodRes.data.products || prodRes.data || [
        { _id: 'p1', name: 'Cement Bag', basePrice: 350 }, { _id: 'p2', name: 'Steel Rod', basePrice: 1500 }
      ]);
    } catch (error) {
      setSuppliers([{ _id: 's1', name: 'ABC Distributors' }, { _id: 's2', name: 'Global Traders' }]);
      setProducts([{ _id: 'p1', name: 'Cement Bag', basePrice: 350 }, { _id: 'p2', name: 'Steel Rod', basePrice: 1500 }]);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitCost: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill unit cost if product selected
    if (field === 'productId') {
      const prod = products.find(p => p._id === value || p.id === value);
      if (prod) {
        newItems[index].unitCost = prod.basePrice || 0;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    
    try {
      await api.post('/purchase-orders', {
        ...formData,
        totalAmount: calculateTotal()
      });
      toast.success('Purchase Order created');
      setFormData({ supplierId: '', expectedDelivery: '', items: [{ productId: '', quantity: 1, unitCost: 0 }] });
      setActiveTab('list');
    } catch (error) {
      toast.error('Failed to create PO');
    }
  };

  const handleReceive = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/receive`);
      toast.success('Stock received and inventory updated');
      fetchPOs();
    } catch (error) {
      toast.error('Failed to mark as received');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-20">
      <div className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#6B7280]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#111827]">Purchase Orders</h1>
        </div>
        <div className="flex bg-[#F8FAFC] p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex justify-center items-center gap-2 ${activeTab === 'list' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveTab('list')}
          >
            <ShoppingBag className="w-4 h-4" /> Pending POs
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex justify-center items-center gap-2 ${activeTab === 'new' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveTab('new')}
          >
            <Plus className="w-4 h-4" /> Create PO
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-[#6B7280] py-10">Loading...</p>
            ) : purchaseOrders.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#E2E8F0] rounded-xl text-[#6B7280]">
                No purchase orders found.
              </div>
            ) : (
              purchaseOrders.map((po) => {
                const id = po._id || po.id;
                const isPending = ['DRAFT', 'ORDERED', 'PENDING'].includes(po.status);
                
                return (
                  <div key={id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[#111827] font-mono">{po.poNumber}</h3>
                        <p className="text-sm font-medium text-[#6B7280]">{po.supplierName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${isPending ? 'bg-[#FFF7ED] text-[#EA580C]' : 'bg-[#F0FDF4] text-[#0D9488]'}`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="bg-[#F8FAFC] p-3 rounded-lg mb-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-[#6B7280]">Total Amount</p>
                        <p className="font-mono font-bold text-[#111827]">₹{po.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Expected Delivery</p>
                        <p className="text-sm text-[#111827] flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#6B7280]" /> {po.expectedDelivery || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {isPending && (
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <button 
                          onClick={() => handleReceive(id)}
                          className="w-full py-2 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors rounded-lg text-sm font-medium flex justify-center items-center gap-2"
                        >
                          <Package className="w-4 h-4" /> Mark as Received
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* New PO Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <h2 className="font-bold text-[#111827] border-b border-[#E2E8F0] pb-2">Order Details</h2>
              
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Supplier *</label>
                <select 
                  required 
                  value={formData.supplierId} 
                  onChange={e => setFormData({...formData, supplierId: e.target.value})}
                  className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Expected Delivery Date</label>
                <input 
                  type="date" 
                  value={formData.expectedDelivery} 
                  onChange={e => setFormData({...formData, expectedDelivery: e.target.value})}
                  className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                <h2 className="font-bold text-[#111827]">Items</h2>
                <button type="button" onClick={handleAddItem} className="text-[#2563EB] text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] relative space-y-2">
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-[#E11D48] hover:bg-[#FFF1F2] rounded-full p-1">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Product</label>
                    <select 
                      required 
                      value={item.productId} 
                      onChange={e => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm outline-none bg-white"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Qty</label>
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm outline-none" min="1" required />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Unit Cost (₹)</label>
                      <input type="number" value={item.unitCost} onChange={e => handleItemChange(index, 'unitCost', Number(e.target.value))} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm font-mono outline-none" min="0" required />
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-[#111827] pt-1">
                    Line Total: <span className="font-mono">₹{item.quantity * item.unitCost}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 mt-4">
                <span className="font-bold text-[#111827]">Total Amount</span>
                <span className="font-mono font-bold text-xl text-[#0D9488]">₹{calculateTotal()}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white py-3 rounded-lg font-medium shadow-sm transition-colors mt-4 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Submit Purchase Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
