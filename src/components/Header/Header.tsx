import React from 'react';
import type { User } from '@supabase/supabase-js';
import { APP_VERSION } from '../../utils/version';
import { LogOut, Kanban, Calendar } from 'lucide-react';
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
        <span className="header-version">v: {APP_VERSION}</span>
      </div>

      <div className="header-right">
        <div className="header-dates-badge">
          <div className="date-item tr">
            <Calendar size={12} className="date-icon-tr" />
            <span className="date-text">{new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>
          </div>
          <div className="date-divider"></div>
          <div className="date-item fa">
            <span className="date-text">{new Intl.DateTimeFormat('fa-IR', { calendar: 'persian', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}</span>
            <Calendar size={12} className="date-icon-fa" />
          </div>
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
      </div>
      
    </header>
  );
};
