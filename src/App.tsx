import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Header } from './components/Header/Header';
import { Board } from './components/Board/Board';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { useTaskStore } from './store/useTaskStore';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { init, loading, error } = useTaskStore();

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load board data whenever user logs in
  useEffect(() => {
    if (user) init(user.id);
  }, [user, init]);

  // 1. Checking auth session
  if (authLoading) {
    return (
      <div className="app-layout">
        <div className="app-loading">
          <div className="loading-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  // 2. Not logged in → show login page
  if (!user) return <LoginPage />;

  // 3. Logged in → show board
  return (
    <div className="app-layout">
      <Header user={user} />
      <main className="main-content">
        {loading ? (
          <div className="app-loading">
            <div className="loading-spinner" />
            <p>Connecting to database…</p>
          </div>
        ) : error ? (
          <div className="app-loading">
            <p className="loading-error">⚠ Could not connect: {error}</p>
            <button onClick={() => init(user.id)}>Retry</button>
          </div>
        ) : (
          <Board />
        )}
      </main>
    </div>
  );
}

export default App;
