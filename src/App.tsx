import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home'; // ✅ Correto - importação nomeada
import Cardapio from './pages/Cardapio';
import Checkout from './pages/Checkout';
import PainelCozinha from './pages/PainelCozinha';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cozinha" element={<PainelCozinha />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;