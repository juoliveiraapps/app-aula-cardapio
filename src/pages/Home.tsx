import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Clock, MapPin, Phone } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

const parceiros = [
  { nome: 'Parceiro 1', logo: 'https://via.placeholder.com/150x80/FF6B35/FFFFFF?text=Parceiro+1' },
  { nome: 'Parceiro 2', logo: 'https://via.placeholder.com/150x80/F7931E/FFFFFF?text=Parceiro+2' },
  { nome: 'Parceiro 3', logo: 'https://via.placeholder.com/150x80/FDC830/FFFFFF?text=Parceiro+3' },
  { nome: 'Parceiro 4', logo: 'https://via.placeholder.com/150x80/FF6B35/FFFFFF?text=Parceiro+4' },
  { nome: 'Parceiro 5', logo: 'https://via.placeholder.com/150x80/F7931E/FFFFFF?text=Parceiro+5' },
];

export function Home() {
  const { config, loading } = useCardapioData();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (parceiros.length * 200));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <img src="/logo-cardapio.png" alt={config?.nome_loja} className="h-40 w-auto" />
              <Link
                to="/cardapio"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Ver Cardápio
              </Link>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
            <div className="max-w-3xl">
              <Coffee className="w-20 h-20 text-orange-400 mx-auto mb-6 animate-bounce" />

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                {config?.nome_loja || 'Bem-vindo'}
              </h1>

              <p className="text-xl md:text-2xl text-gray-100 mb-8 drop-shadow-lg">
                Sabores que aquecem o coração e alegram o dia
              </p>

              <Link
                to="/cardapio"
                className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-110"
              >
                Fazer Pedido Agora
              </Link>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <Clock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Horário</h3>
                  <p className="text-gray-200 text-sm">{config?.horario_funcionamento || 'Seg-Sex: 8h-18h'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <MapPin className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Localização</h3>
                  <p className="text-gray-200 text-sm">{config?.endereco_loja || 'Centro da Cidade'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <Phone className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">WhatsApp</h3>
                  <p className="text-gray-200 text-sm">{config?.telefone_whatsapp || '(00) 00000-0000'}</p>
                </div>
              </div>
            </div>
          </main>

          <div className="pb-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-white text-center mb-6">Nossos Parceiros</h2>

              <div className="relative overflow-hidden">
                <div
                  className="flex gap-8 transition-transform duration-1000 ease-linear"
                  style={{
                    transform: `translateX(-${scrollPosition}px)`,
                  }}
                >
                  {[...parceiros, ...parceiros, ...parceiros].map((parceiro, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 bg-white rounded-lg p-4 shadow-lg"
                      style={{ width: '150px' }}
                    >
                      <img
                        src={parceiro.logo}
                        alt={parceiro.nome}
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
