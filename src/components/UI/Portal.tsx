import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const portalRoot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    portalRoot.current = document.createElement('div');
    portalRoot.current.id = 'portal-root';
    document.body.appendChild(portalRoot.current);

    return () => {
      if (portalRoot.current) {
        document.body.removeChild(portalRoot.current);
      }
    };
  }, []);

  if (!portalRoot.current) return null;

  return createPortal(children, portalRoot.current);
};
