import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabase';

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    supabase
      .from('page_views')
      .insert({ path: location.pathname })
      .then(({ error }) => {
        if (error) console.error('page_view error:', error.message);
      });
  }, [location.pathname]);
}
