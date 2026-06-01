import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = location.state?.from?.pathname || '/admin';

  // Se já estiver logado, redireciona para o admin
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos' 
        : 'Ocorreu um erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-200 via-neutral-50 to-neutral-50 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-900"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center">
            <div className="bg-neutral-900 dark:bg-white p-3 rounded-xl shadow-lg shadow-neutral-900/10 dark:shadow-white/10">
              <LogIn className="w-8 h-8 text-white dark:text-neutral-900" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Acesse o sistema para gerenciar veículos
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-neutral-800 py-8 px-4 shadow-xl shadow-black/5 dark:shadow-black/20 sm:rounded-2xl sm:px-10 border border-neutral-200 dark:border-neutral-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                E-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 dark:focus:ring-white dark:focus:border-white bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white sm:text-sm transition-colors"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 dark:focus:ring-white dark:focus:border-white bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-neutral-900 focus:ring-neutral-900 border-neutral-300 rounded dark:border-neutral-600 dark:bg-neutral-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 dark:focus:ring-offset-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Entrar no sistema'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
