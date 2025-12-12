import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-bold text-gray-800">Carregando Cardápio</h2>
      <p className="text-gray-600 mt-2">Preparando as delícias...</p>
    </div>
  </div>
);

export default LoadingSpinner;