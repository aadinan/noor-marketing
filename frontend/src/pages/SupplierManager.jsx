import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TrendingUp, Truck, DollarSign } from 'lucide-react';

const SupplierManager = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products to manage prices
    api.get('/products').then(res => setProducts(res.data.products || res.data.data || res.data || []));
  }, []);

  const calculateMargin = (cost, price) => {
    if (!price || !cost) return 0;
    const margin = ((price - cost) / price) * 100;
    return margin.toFixed(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier & Price Manager</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2">
          <Truck size={20} /> Create Purchase Order
        </button>
      </div>

      {/* MARGIN ANALYZER TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between">
          <h3 className="font-bold text-gray-700">Price & Margin Monitor</h3>
          <span className="text-xs text-gray-500">Live Profitability Check</span>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 font-bold border-b">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right bg-red-50 text-red-800">Your Cost (CP)</th>
              <th className="p-4 text-right bg-green-50 text-green-800">Selling Price (SP)</th>
              <th className="p-4 text-center">Margin %</th>
              <th className="p-4 text-center">Profit / Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => {
              const basePrice = p.basePrice || 0;
              const sellingPrice = p.price || p.mrp || 0;
              const margin = calculateMargin(basePrice, sellingPrice);
              const profit = (sellingPrice - basePrice).toFixed(0);

              return (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {p.name}
                    <div className="text-xs text-gray-400">{p.sku}</div>
                  </td>
                  <td className="p-4">{p.inventory?.stockCount || p.stockCount || 0}</td>

                  {/* EDITABLE INPUTS (In a real app, make these inputs to update DB) */}
                  <td className="p-4 text-right font-mono">₹{basePrice}</td>
                  <td className="p-4 text-right font-mono font-bold">₹{sellingPrice}</td>

                  {/* DYNAMIC MARGIN INDICATOR */}
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${margin < 15 ? 'bg-red-100 text-red-600' :
                        margin > 30 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {margin}%
                    </span>
                  </td>
                  <td className="p-4 text-center text-green-600 font-bold">
                    ₹{profit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierManager;