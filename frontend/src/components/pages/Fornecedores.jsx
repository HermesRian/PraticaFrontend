import React from 'react';
import FornecedorListMUI from '../Fornecedor/FornecedorListMUI';
import FornecedorFormMUI from '../Fornecedor/FornecedorFormMUI';
import { Routes, Route } from 'react-router-dom';

const Fornecedores = () => {
  return (
    <Routes>
      <Route path="/" element={<FornecedorListMUI />} />
      <Route path="/new" element={<FornecedorFormMUI />} />
      <Route path="/edit/:id" element={<FornecedorFormMUI />} />
    </Routes>
  );
};

export default Fornecedores;