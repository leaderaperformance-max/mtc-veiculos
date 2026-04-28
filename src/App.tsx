/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Estoque } from "./pages/Estoque";
import { Carro } from "./pages/Carro";
import { Financiamento } from "./pages/Financiamento";
import { Contato } from "./pages/Contato";
import { Comparar } from "./pages/Comparar";
import { Favoritos } from "./pages/Favoritos";
import { CompareProvider } from "./contexts/CompareContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

// Importações do Admin
import { AuthProvider } from "./contexts/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { Login } from "./pages/admin/Login";
import { Dashboard } from "./pages/admin/Dashboard";
import { VeiculosList } from "./pages/admin/veiculos/VeiculosList";
import { VeiculoForm } from "./pages/admin/veiculos/VeiculoForm";
import { Relatorios } from "./pages/admin/relatorios/Relatorios";
import { Configuracoes } from "./pages/admin/configuracoes/Configuracoes";

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="estoque" element={<Estoque />} />
              <Route path="carro/:slug" element={<Carro />} />
              <Route path="financiamento" element={<Financiamento />} />
              <Route path="contato" element={<Contato />} />
              <Route path="comparar" element={<Comparar />} />
              <Route path="favoritos" element={<Favoritos />} />
            </Route>

            {/* Rotas Administrativas - Públicas */}
            <Route path="/admin/login" element={<Login />} />

            {/* Rotas Administrativas - Protegidas */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="veiculos" element={<VeiculosList />} />
                <Route path="veiculos/novo" element={<VeiculoForm />} />
                <Route path="veiculos/editar/:id" element={<VeiculoForm />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
