import React from 'react';
import type { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Header.css';

interface HeaderProps {
  user?: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-mark">K</div>
        <h1>Kanban Board</h1>
      </div>

      {user && (
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
};
