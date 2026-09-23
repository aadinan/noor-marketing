import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import QuotationCard from '../components/QuotationCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await api.get('/quotations');
        // Guard against non-array response
        const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data.quotations || []);
        setQuotations(data);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        toast.error('Failed to load quotations');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  // 2. Handle Conversion (Quote -> Order)
  const handleConvert = async (quoteId) => {
    if (!window.confirm("Convert this Quote to a Real Order?")) return;

    try {
      const res = await api.post(`/quotations/${quoteId}/convert`);
      if (res.data.success) {
        toast.success('Order Created from Quotation!');
        setQuotations(prev => prev.map(q =>
          q._id === quoteId ? { ...q, status: 'CONVERTED' } : q
        ));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conversion Failed');
    }
  };

  // 3. Search Logic (Filters by Name, Shop, or Quote #)
  const filteredQuotes = quotations.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    const name = q.retailer ? q.retailer.shopName : q.customerInfo?.name;
    const number = q.quotationNumber;
    return name?.toLowerCase().includes(searchLower) || number?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">My Quotations</h1>
          <button
            onClick={() => navigate('/quotations/new')}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Client or Quote ID..."
            className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="p-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading Proposals...</p>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center mt-10 opacity-50">
            <Filter size={48} className="mx-auto mb-2" />
            <p>No quotations found.</p>
          </div>
        ) : (
          filteredQuotes.map(quote => (
            <QuotationCard
              key={quote._id}
              quote={quote}
              onConvert={handleConvert}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QuotationList;