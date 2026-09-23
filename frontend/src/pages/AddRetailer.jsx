import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store, User, Phone, MapPin, FileText, TrendingUp, Save, ArrowLeft, Percent, ShieldCheck } from 'lucide-react';

const AddRetailer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phoneNumber: '',
    gstNumber: '',
    city: '',
    address: '',
    creditLimit: 10000,
    incentiveStaffName: '',
    incentiveStaffPhone: '',
    incentiveTarget: '',
    incentivePercentage: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.phoneNumber.length !== 10) {
      toast.error("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    // 1. Construct Clean Payload
    const cleanPayload = {
      shopName: formData.shopName,
      ownerName: formData.ownerName,
      phoneNumber: formData.phoneNumber,
      gstNumber: formData.gstNumber,
      creditLimit: Number(formData.creditLimit),

      // Address Object Construction
      address: {
        line1: formData.address || "",
        city: formData.city
      },

      // Optionals
      incentiveStaffName: formData.incentiveStaffName,
      incentiveStaffPhone: formData.incentiveStaffPhone,
      incentiveTarget: Number(formData.incentiveTarget) || 0,
      incentivePercentage: Number(formData.incentivePercentage) || 0
    };

    try {
      const res = await api.post('/retailers', cleanPayload);

      if (res.data.success) {
        toast.success("Shop Registered Successfully!");
        // ✅ FIX: Redirect to the new shop's profile page with KPI cards loaded
        const newShopId = res.data.data?._id;
        if (newShopId) {
          navigate(`/retailers/${newShopId}`);
        } else {
          navigate('/retailers');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration Failed";
      toast.error(msg);
      console.error("Backend Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-800">Register Shop</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required Details Section */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Required Details</p>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-1"><Store size={14} /> Shop Name *</label>
            <input type="text" name="shopName" required placeholder="e.g. Royal Electricals" onChange={handleChange} className="w-full font-bold text-lg outline-none border-b border-gray-200 pb-2 placeholder-gray-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-1"><User size={14} /> Owner *</label>
              <input type="text" name="ownerName" required placeholder="Name" onChange={handleChange} className="w-full outline-none border-b border-gray-200 pb-2 placeholder-gray-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-1"><Phone size={14} /> Mobile *</label>
              <input type="tel" name="phoneNumber" required pattern="[0-9]{10}" placeholder="9876543210" onChange={handleChange} className="w-full outline-none border-b border-gray-200 pb-2 placeholder-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-1"><MapPin size={14} /> City *</label>
              <input type="text" name="city" required placeholder="e.g. Mangalore" onChange={handleChange} className="w-full outline-none border-b border-gray-200 pb-2 placeholder-gray-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-1"><FileText size={14} /> GST No. *</label>
              <input type="text" name="gstNumber" required placeholder="GSTIN" onChange={handleChange} className="w-full outline-none border-b border-gray-200 pb-2 placeholder-gray-300 uppercase" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1">Full Address (Optional)</label>
            <input type="text" name="address" placeholder="Street / Area / Building" onChange={handleChange} className="w-full outline-none text-sm text-gray-600 placeholder-gray-300" />
          </div>
        </div>

        {/* Credit Limit Display */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-lg"><ShieldCheck size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">System Credit Assigned</p>
              <p className="text-lg font-black text-emerald-800">₹10,000</p>
            </div>
          </div>
          <p className="text-[9px] text-emerald-500 text-right w-24 leading-tight italic">Automatically increases weekly via Credit Engine</p>
        </div>

        {/* Optional Section */}
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 mt-6">Staff Incentive (Optional)</p>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-blue-500 mb-1">Staff Name</label>
              <input type="text" name="incentiveStaffName" placeholder="Manager Name" onChange={handleChange} className="w-full bg-transparent outline-none border-b border-blue-200 pb-2 text-blue-800 placeholder-blue-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-500 mb-1">Staff Phone</label>
              <input type="tel" name="incentiveStaffPhone" placeholder="Contact" onChange={handleChange} className="w-full bg-transparent outline-none border-b border-blue-200 pb-2 text-blue-800 placeholder-blue-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-blue-500 flex items-center gap-1 mb-1"><TrendingUp size={12} /> Target</label>
              <input type="number" name="incentiveTarget" placeholder="50000" onChange={handleChange} className="w-full bg-transparent outline-none border-b border-blue-200 pb-2 text-blue-800 placeholder-blue-300" />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-500 flex items-center gap-1 mb-1"><Percent size={12} /> Incentive %</label>
              <input type="number" name="incentivePercentage" placeholder="2" onChange={handleChange} className="w-full bg-transparent outline-none border-b border-blue-200 pb-2 text-blue-800 placeholder-blue-300" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition mt-4 disabled:opacity-50">
          {loading ? "Registering..." : <><Save size={20} /> Register Shop</>}
        </button>
      </form>
    </div>
  );
};

export default AddRetailer;