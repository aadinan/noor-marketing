import React from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ApprovalCard = ({ order, onRefresh }) => {
    const handleApprove = async () => {
        try {
            await api.put(`/orders/${order._id}/approve-credit`);
            toast.success("Order Cleared!");
            if (onRefresh) onRefresh(); // Refresh the list
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/orders/${order._id}/approve-credit`, { action: 'reject' });
            toast.info('Credit request rejected');
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    return (
        <div className="bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-sm mb-4 flex justify-between items-center">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded">HIGH DEBT</span>
                    <span className="text-sm font-bold text-slate-800">{order.retailer?.shopName}</span>
                </div>
                <p className="text-lg font-black text-slate-900">₹{order.netPayable || order.requestedAmount}</p>
                <p className="text-[10px] text-slate-400">Requested by: {order.salesman?.username || "Unknown"}</p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleApprove}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                >
                    Approve
                </button>
                <button onClick={handleReject} className="text-slate-400 text-sm font-bold px-2 hover:text-slate-600">Reject</button>
            </div>
        </div>
    );
};

export default ApprovalCard;
