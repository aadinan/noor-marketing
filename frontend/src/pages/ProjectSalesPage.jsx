import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Building2, Plus, CheckCircle, XCircle, ArrowLeft, FileText, Truck } from 'lucide-react';
import api from '../api/axios';

const ProjectSalesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [role, setRole] = useState('Salesman');
  
  // List State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    clientType: 'Retailer',
    siteAddress: '',
    estimatedValue: '',
    requiresDelivery: false,
    discountPercent: 0,
    notes: '',
    items: [{ productName: '', quantity: 1, unit: 'pcs', unitPrice: 0 }]
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setRole(parsed.role);
      } catch (e) {}
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/project-orders');
      setProjects(data.projects || data || []);
    } catch (error) {
      // Fallback for UI building
      setProjects([
        { _id: '1', projectName: 'Skyline Towers', clientName: 'ABC Construction', estimatedValue: 125000, status: 'PENDING_REVIEW', date: '2023-10-25' },
        { _id: '2', projectName: 'Villa 45 Renovation', clientName: 'Mr. Sharma', estimatedValue: 45000, status: 'APPROVED', date: '2023-10-20' },
        { _id: '3', projectName: 'City Mall Tiles', clientName: 'XYZ Decorators', estimatedValue: 200000, status: 'REJECTED', date: '2023-10-15', rejectReason: 'Value too high for this client' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', quantity: 1, unit: 'pcs', unitPrice: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubTotal = () => {
    return formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const calculateGrandTotal = () => {
    const subTotal = calculateSubTotal();
    const estVal = Number(formData.estimatedValue) || subTotal;
    return estVal - (estVal * (formData.discountPercent / 100));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/project-orders', formData);
      toast.success('Project created successfully');
      setFormData({
        projectName: '', clientName: '', clientType: 'Retailer', siteAddress: '',
        estimatedValue: '', requiresDelivery: false, discountPercent: 0, notes: '',
        items: [{ productName: '', quantity: 1, unit: 'pcs', unitPrice: 0 }]
      });
      setActiveTab('list');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/project-orders/${id}/approve`);
      toast.success('Project approved');
      fetchProjects();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const submitReject = async (id) => {
    if (!rejectReason) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await api.put(`/project-orders/${id}/reject`, { reason: rejectReason });
      toast.success('Project rejected');
      setRejectId(null);
      setRejectReason('');
      fetchProjects();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const isManagement = role === 'Manager' || role === 'Boss';
  
  const filteredProjects = projects.filter(p => 
    filterStatus === 'All' ? true : p.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F8FAFC] rounded-full text-[#6B7280]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#111827]">Project Sales</h1>
        </div>
        <div className="flex bg-[#F8FAFC] p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'list' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveTab('list')}
          >
            Projects List
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
            onClick={() => setActiveTab('new')}
          >
            New Project
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
              {['All', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                    filterStatus === status 
                      ? 'bg-[#111827] text-white border-[#111827]' 
                      : 'bg-white text-[#6B7280] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-[#6B7280] py-10">Loading...</p>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#E2E8F0] rounded-xl text-[#6B7280]">
                No projects found.
              </div>
            ) : (
              filteredProjects.map((project) => {
                const id = project._id || project.id;
                
                let badgeClass = "bg-[#EFF6FF] text-[#2563EB]";
                if (project.status === 'APPROVED') badgeClass = "bg-[#F0FDF4] text-[#0D9488]";
                if (project.status === 'REJECTED') badgeClass = "bg-[#FFF1F2] text-[#E11D48]";
                if (project.status === 'PENDING_REVIEW') badgeClass = "bg-[#FFF7ED] text-[#EA580C]";

                return (
                  <div key={id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[#111827] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#6B7280]" />
                          {project.projectName}
                        </h3>
                        <p className="text-sm text-[#6B7280]">{project.clientName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${badgeClass}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-lg mb-3">
                      <span className="text-sm text-[#6B7280]">Estimated Value:</span>
                      <span className="font-mono font-bold text-[#111827]">₹{project.estimatedValue}</span>
                    </div>

                    {project.status === 'REJECTED' && project.rejectReason && (
                      <div className="text-xs text-[#E11D48] bg-[#FFF1F2] p-2 rounded mb-3 border border-[#FEE2E2]">
                        <span className="font-bold">Reason: </span>{project.rejectReason}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                      {project.status === 'APPROVED' && (
                        <button className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-[#0F766E]">
                          <FileText className="w-4 h-4" /> Convert to Active Order
                        </button>
                      )}
                      
                      {isManagement && project.status === 'PENDING_REVIEW' && rejectId !== id && (
                        <>
                          <button onClick={() => setRejectId(id)} className="flex-1 py-2 border border-[#E11D48] text-[#E11D48] rounded-lg text-sm font-medium flex justify-center items-center gap-1 hover:bg-[#FFF1F2]">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button onClick={() => handleApprove(id)} className="flex-1 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium flex justify-center items-center gap-1 hover:bg-[#1E40AF]">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        </>
                      )}

                      {rejectId === id && (
                        <div className="w-full space-y-2">
                          <input 
                            type="text" 
                            placeholder="Reason for rejection" 
                            className="w-full border border-[#E2E8F0] p-2 rounded text-sm outline-none focus:border-[#E11D48]"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setRejectId(null)} className="flex-1 py-1.5 border border-[#E2E8F0] text-[#6B7280] rounded text-sm">Cancel</button>
                            <button onClick={() => submitReject(id)} className="flex-1 py-1.5 bg-[#E11D48] text-white rounded text-sm">Confirm Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* New Project Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <h2 className="font-bold text-[#111827] border-b border-[#E2E8F0] pb-2">Project Details</h2>
              
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Project Name *</label>
                <input required type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none" placeholder="e.g. Skyline Towers Phase 1" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Client Name *</label>
                  <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Client Type</label>
                  <select value={formData.clientType} onChange={e => setFormData({...formData, clientType: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white">
                    <option>Retailer</option>
                    <option>Contractor</option>
                    <option>Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Estimated Value (₹)</label>
                <input type="number" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm font-mono focus:border-[#2563EB] outline-none" />
                {Number(formData.estimatedValue) > 100000 && (
                  <p className="text-xs text-[#EA580C] bg-[#FFF7ED] mt-2 p-1.5 rounded inline-block font-medium">High Value - Requires Manager Approval</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Site Address</label>
                <textarea rows="2" value={formData.siteAddress} onChange={e => setFormData({...formData, siteAddress: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none"></textarea>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#111827] cursor-pointer">
                <input type="checkbox" checked={formData.requiresDelivery} onChange={e => setFormData({...formData, requiresDelivery: e.target.checked})} className="w-4 h-4 text-[#2563EB] rounded" />
                <Truck className="w-4 h-4 text-[#6B7280]" /> Requires Site Delivery
              </label>
            </div>

            {/* BOQ / Items Section */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                <h2 className="font-bold text-[#111827]">Bill of Quantities (BOQ)</h2>
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
                    <input type="text" value={item.productName} onChange={e => handleItemChange(index, 'productName', e.target.value)} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm outline-none" required />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Qty</label>
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm outline-none" min="1" required />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Unit</label>
                      <input type="text" value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Price (₹)</label>
                      <input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} className="w-full border border-[#E2E8F0] p-1.5 rounded text-sm font-mono outline-none" min="0" required />
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-[#111827] pt-1">
                    Line Total: <span className="font-mono">₹{item.quantity * item.unitPrice}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Submit */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] text-sm">Discount (%)</span>
                <input type="number" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} className="border border-[#E2E8F0] p-1.5 rounded text-sm w-20 text-right outline-none focus:border-[#2563EB]" min="0" max="100" />
              </div>
              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                <span className="font-bold text-[#111827]">Grand Total</span>
                <span className="font-mono font-bold text-xl text-[#0D9488]">₹{calculateGrandTotal()}</span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Internal Notes</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-[#E2E8F0] p-2 rounded-lg text-sm focus:border-[#2563EB] outline-none" placeholder="Any special instructions..."></textarea>
              </div>

              <button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white py-3 rounded-lg font-medium shadow-sm transition-colors mt-2">
                Submit Project
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectSalesPage;
