import { useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Board } from './components/Board/Board';
import { useTaskStore } from './store/useTaskStore';
import './App.css';

function App() {
  const { init, loading, error } = useTaskStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {loading ? (
          <div className="app-loading">
            <div className="loading-spinner" />
            <p>Connecting to database…</p>
          </div>
        ) : error ? (
          <div className="app-loading">
            <p className="loading-error">⚠ Could not connect: {error}</p>
            <button onClick={() => init()}>Retry</button>
          </div>
        ) : (
          <Board />
        )}
      </main>
    </div>
  );
}

export default App;
