import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: res.data.username,
        role: res.data.role,
        id: res.data._id
      }));

      const role = res.data.role;

      switch (role) {
        case 'Boss': navigate('/boss'); break;
        case 'Admin': navigate('/admin'); break;
        case 'Manager': navigate('/manager'); break;
        case 'Warehouse': navigate('/warehouse'); break;
        case 'Salesman': navigate('/sales'); break;
        default: navigate('/');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials. Please check your username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-black text-center mb-6">NOOR LOGIN</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-4 mb-4 bg-gray-100 rounded-xl"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full p-4 bg-gray-100 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            className="absolute right-4 top-4 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-70">
          {loading ? <LoadingSpinner inline={true} message="Logging in..." /> : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;