import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-mark">K</div>
        <h1>Kanban Board</h1>
      </div>
    </header>
  );
};
