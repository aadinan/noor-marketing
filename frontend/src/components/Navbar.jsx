import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = ({ role = 'User', title = 'Noor Marketing ERP' }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'user' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="bg-slate-900 border-b border-slate-800 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-black">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-400" />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold">{user.username}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{role}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl transition font-bold text-sm"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
