/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Estoque } from "./pages/Estoque";
import { Carro } from "./pages/Carro";
import { Financiamento } from "./pages/Financiamento";
import { Sobre } from "./pages/Sobre";
import { Contato } from "./pages/Contato";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="carro/:slug" element={<Carro />} />
          <Route path="financiamento" element={<Financiamento />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="contato" element={<Contato />} />
          <Route path="comparar" element={<div className="p-24 text-center text-2xl">Comparador (Em construção)</div>} />
          <Route path="favoritos" element={<div className="p-24 text-center text-2xl">Favoritos (Em construção)</div>} />
          <Route path="admin/dashboard" element={<div className="p-24 text-center text-2xl">Admin Dashboard (Em construção)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
