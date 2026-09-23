import React, { useState } from 'react';

const ManagerPINModal = ({ isOpen, message, onConfirm, onCancel }) => {
    const [pin, setPin] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(pin);
        setPin('');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="font-black text-xl text-slate-800 mb-2">Manager Override</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">{message || "Enter Manager PIN to authorize this action."}</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Enter PIN"
                        className="w-full text-center text-2xl tracking-[0.5em] font-black outline-none border-b-2 border-slate-200 focus:border-blue-500 pb-2 mb-8 bg-transparent"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!pin}
                            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 shadow-lg shadow-red-200"
                        >
                            Verify & Approve
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManagerPINModal;
