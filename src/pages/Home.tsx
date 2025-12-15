import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Users, Star } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

// Interface para parceiros
interface Parceiro {
  nome: string;
  imagem: string;
  descricao?: string;
  id?: string;
}

export function Home() {
  const { config, loading } = useCardapioData();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loadingParceiros, setLoadingParceiros] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Buscar parceiros da API
  useEffect(() => {
    const fetchParceiros = async () => {
      try {
        setLoadingParceiros(true);
        const response = await fetch('/api?action=getParceiros');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.parceiros)) {
          setParceiros(data.parceiros);
        } else {
          console.warn('Nenhum parceiro encontrado ou erro na API:', data);
          setParceiros([]);
        }
      } catch (error) {
        console.error('Erro ao buscar parceiros:', error);
        setParceiros([]);
      } finally {
        setLoadingParceiros(false);
      }
    };

    fetchParceiros();
  }, []);

  // Efeito para carrossel automático
  useEffect(() => {
    if (parceiros.length === 0) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        // Cada item tem 150px + 32px de gap = 182px
        const itemWidth = 182;
        const totalWidth = parceiros.length * itemWidth;
        const nextPosition = (prev + itemWidth) % totalWidth;
        return nextPosition;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [parceiros.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Configurações padrão caso não tenha no Google Sheets
  const defaultConfig = {
    nome_loja: config?.Loja || config?.nome_loja || 'Coffee House',
    descricao_loja: 'Sabores que aquecem o coração e alegram o dia'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#400b0b]/90 via-[#400b0b]/70 to-[#e58840]/90" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src="/logo-cardapio.png" 
                  alt={defaultConfig.nome_loja} 
                  className="h-24 md:h-32 w-auto drop-shadow-lg"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">
                    {defaultConfig.nome_loja}
                  </h1>
                  <p className="text-[#e58840] text-sm md:text-base">
                    Sua experiência em café
                  </p>
                </div>
              </div>
              
             
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl">
              <Coffee className="w-24 h-24 text-[#e58840] mx-auto mb-6 animate-pulse" />

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                {defaultConfig.nome_loja}
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-[#e58840] mb-8 drop-shadow-lg font-medium max-w-2xl mx-auto">
                {defaultConfig.descricao_loja}
              </p>

              {/* Botão ÚNICO centralizado */}
              <div className="mb-12">
                <Link
                  to="/cardapio"
                  className="inline-block bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] px-10 py-4 md:px-14 md:py-5 rounded-full text-lg md:text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-[#e58840]/50 transform hover:scale-110 flex items-center justify-center gap-3 mx-auto w-fit"
                >
                  <Coffee className="w-6 h-6 md:w-7 md:h-7" />
                  Fazer Pedido Agora
                </Link>
              </div>

              {/* Cards removidos conforme solicitado */}
            </div>
          </main>

          {/* Seção de Parceiros */}
          {parceiros.length > 0 && (
            <div className="py-12 bg-gradient-to-t from-[#400b0b]/30 to-transparent">
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-[#e58840]/20 text-[#e58840] px-4 py-2 rounded-full mb-3">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Nossos Parceiros</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Apoiadores Especiais
                  </h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Conheça quem apoia nosso trabalho e faz parte da nossa história
                  </p>
                </div>

                {loadingParceiros ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e58840]"></div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden">
                    <div
                      className="flex gap-8 transition-transform duration-1000 ease-in-out"
                      style={{
                        transform: `translateX(-${scrollPosition}px)`,
                        width: `${parceiros.length * 200}px`
                      }}
                    >
                      {/* Duplicar para efeito contínuo */}
                      {[...parceiros, ...parceiros].map((parceiro, index) => (
                        <div
                          key={`${parceiro.id || parceiro.nome}-${index}`}
                          className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20 hover:border-[#e58840]/50 transition-all duration-300 hover:shadow-[#e58840]/25 hover:scale-105"
                          style={{ width: '180px' }}
                        >
                          <div className="h-24 mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-white/10">
                            <img
                              src={parceiro.imagem}
                              alt={parceiro.nome}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1567446537711-4302c76e0b8c?w=200&h=200&fit=crop';
                              }}
                            />
                          </div>
                          <h3 className="text-white font-bold text-center mb-1 text-sm truncate">
                            {parceiro.nome}
                          </h3>
                          {parceiro.descricao && (
                            <p className="text-gray-300 text-xs text-center truncate">
                              {parceiro.descricao}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Setas de navegação (opcional) */}
                    <button
                      onClick={() => {
                        const itemWidth = 182;
                        setScrollPosition((prev) => Math.max(0, prev - itemWidth * 3));
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#e58840] text-[#400b0b] p-2 rounded-full hover:bg-[#e58840]/90 transition-all duration-300 z-10"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        const itemWidth = 182;
                        setScrollPosition((prev) => prev + itemWidth * 3);
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#e58840] text-[#400b0b] p-2 rounded-full hover:bg-[#e58840]/90 transition-all duration-300 z-10"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="py-6 border-t border-white/10">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#e58840]" />
                <span className="text-white font-medium">{defaultConfig.nome_loja}</span>
                <Star className="w-4 h-4 text-[#e58840]" />
              </div>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {defaultConfig.nome_loja}. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Sistema de cardápio digital integrado ao Google Sheets
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}