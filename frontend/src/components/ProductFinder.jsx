import { useState } from 'react';
import api from '../api/axios';
import { Search, MapPin, Box } from 'lucide-react';

const ProductFinder = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Search by SKU or Name
      const res = await api.get(`/products/search?q=${query}`);
      setResult(res.data[0]); // Show top result
    } catch (err) {
      console.error("Search failed");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search SKU (e.g. WP-LED-9W)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Find</button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-top-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-800">{result.name}</h4>
              <p className="text-xs text-gray-500 font-mono">{result.sku}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${result.inventory.restockStatus === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.inventory.restockStatus}
            </span>
          </div>
          
          <div className="mt-3 flex items-center gap-3 text-sm">
             <div className="flex items-center gap-1 text-blue-700 bg-white px-3 py-1 rounded shadow-sm">
                <MapPin size={14} /> <strong>{result.inventory.physicalPath}</strong>
             </div>
             <div className="flex items-center gap-1 text-gray-700">
                <Box size={14} /> Stock: <strong>{result.inventory.stockCount}</strong>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFinder;