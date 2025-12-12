import React from 'react';
import { Link } from 'react-router-dom';

const Checkout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Página em Construção
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Estamos preparando a melhor experiência de checkout para você!
          </p>
          <Link
            to="/cardapio"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            Voltar ao Cardápio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;