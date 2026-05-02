import React, { useState } from 'react';
import { Kanban } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(err.message);
      } else {
        setSuccess('Account created! Check your email to confirm, then log in.');
        setMode('login');
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      // On success, App.tsx's onAuthStateChange fires → board loads automatically
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Dynamic Background Elements */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      
      <div className="floating-boards">
        <div className="board-prop board-1">
          <div className="prop-header"></div><div className="prop-card"></div><div className="prop-card"></div>
        </div>
        <div className="board-prop board-2">
          <div className="prop-header"></div><div className="prop-card"></div>
        </div>
        <div className="board-prop board-3">
          <div className="prop-header"></div><div className="prop-card"></div><div className="prop-card"></div><div className="prop-card"></div>
        </div>
      </div>

      <div className="login-card glass-panel">
        {/* Logo matching the Header */}
        <div className="login-logo-container">
          <div className="login-logo-mark">
            <Kanban size={28} strokeWidth={2.5} />
          </div>
          <h1 className="login-logotype">
            <span className="login-logotype-kanban">Kanban</span>
            <span className="login-logotype-board">Board</span>
          </h1>
        </div>

        <p className="login-subtitle">
          {mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error   && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : null}
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} type="button">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
