import React from 'react';
import ClienteList from '../Cliente/ClienteList';
import ClienteForm from '../Cliente/ClienteFormMUI';
import { Routes, Route } from 'react-router-dom';

const Clientes = () => {
  return (
    <Routes>
      <Route path="/" element={<ClienteList />} />
      <Route path="/cadastrar" element={<ClienteForm />} />
      <Route path="/editar/:id" element={<ClienteForm />} />
    </Routes>
  );
};

export default Clientes;