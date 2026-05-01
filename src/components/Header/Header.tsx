import React from 'react';
import type { User } from '@supabase/supabase-js';
import { LogOut, Kanban } from 'lucide-react';
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
        <div className="logo-mark">
          <Kanban size={20} strokeWidth={2.5} />
        </div>
        <h1 className="logotype">
          <span className="logotype-kanban">Kanban</span>
          <span className="logotype-board">Board</span>
        </h1>
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
