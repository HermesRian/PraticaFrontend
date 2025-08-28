import React from 'react';
import FuncionarioList from '../Funcionario/FuncionarioList';
import FuncionarioForm from '../Funcionario/FuncionarioForm';
import { Routes, Route } from 'react-router-dom';

const Funcionarios = () => {
  return (
    <Routes>
      <Route path="/" element={<FuncionarioList />} />
      <Route path="/cadastrar" element={<FuncionarioForm />} />
      <Route path="/editar/:id" element={<FuncionarioForm />} />
    </Routes>
  );
};

export default Funcionarios;