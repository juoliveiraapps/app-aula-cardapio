// Portal.tsx
import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const portalRoot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Verificar se já existe um portal-root
    let existingPortal = document.getElementById('portal-root');
    if (existingPortal) {
      portalRoot.current = existingPortal as HTMLDivElement;
    } else {
      portalRoot.current = document.createElement('div');
      portalRoot.current.id = 'portal-root';
      document.body.appendChild(portalRoot.current);
    }

    return () => {
      // Não remover o elemento, apenas limpá-lo
      if (portalRoot.current) {
        portalRoot.current.innerHTML = '';
      }
    };
  }, []);

  if (!portalRoot.current) return null;

  return createPortal(children, portalRoot.current);
};