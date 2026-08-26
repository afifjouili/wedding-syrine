import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function AdminLogin({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'Samar43313313*';
    
    if (password === correctPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8f1e5] flex items-center justify-center p-4 font-body text-[#3d2e1e]">
      <div className="bg-[#f0e5d3] p-8 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-md w-full border border-[#a9802f]/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display italic text-[#a9802f] mb-2">Admin Access</h2>
          <p className="text-[#6c513f] font-elegant text-xs tracking-[0.2em] uppercase">The Sacred Garden · Management</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-[#a9802f] font-elegant text-xs uppercase tracking-wider">
              Password
            </Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter admin password"
              className="bg-[#faf5ec] border-[#a9802f]/30 text-[#3d2e1e] focus:border-[#a9802f] focus:ring-[#a9802f] rounded-[5px]"
              dir="auto"
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 p-3 rounded-[5px] border border-red-800/40">
              {error}
            </p>
          )}
          
          <button 
            type="submit" 
            className="btn-2 w-full"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
