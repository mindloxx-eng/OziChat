import { useEffect, useState } from 'react';

export type AdminRoute = 'dashboard' | 'users';

const parse = (): AdminRoute => {
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  switch (raw) {
    case 'users':
    case 'dashboard':
      return raw;
    default:
      return 'dashboard';
  }
};

export const useHashRoute = (): [AdminRoute, (r: AdminRoute) => void] => {
  const [route, setRoute] = useState<AdminRoute>(parse());

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (r: AdminRoute) => {
    window.location.hash = `#/${r}`;
  };

  return [route, navigate];
};
