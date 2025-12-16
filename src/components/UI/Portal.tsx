// Portal.tsx
import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Criar ou reutilizar o container do portal
    let container = document.getElementById('portal-root');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'portal-root';
      document.body.appendChild(container);
    }
    
    setPortalContainer(container);

    // Não remover o container no cleanup, apenas gerenciamos o conteúdo
    return () => {
      // O container permanece no DOM para reutilização
    };
  }, []);

  if (!portalContainer) return null;

  return createPortal(children, portalContainer);
};