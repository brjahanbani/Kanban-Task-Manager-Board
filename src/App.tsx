import { Header } from './components/Header/Header';
import { Board } from './components/Board/Board';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Board />
      </main>
    </div>
  );
}

export default App;
