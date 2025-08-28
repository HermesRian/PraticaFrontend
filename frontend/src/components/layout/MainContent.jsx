import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';

import ClienteList from '../Cliente/ClienteListMUI';
import ClienteForm from '../Cliente/ClienteFormMUI';

import FornecedorList from '../Fornecedor/FornecedorListMUI';
import FornecedorForm from '../Fornecedor/FornecedorFormMUI';

import FuncionarioList from '../Funcionario/FuncionarioListMUI';
import FuncionarioForm from '../Funcionario/FuncionarioFormMUI';

import FuncaoFuncionarioList from '../FuncaoFuncionario/FuncaoFuncionarioListMUI';
import FuncaoFuncionarioForm from '../FuncaoFuncionario/FuncaoFuncionarioFormMUI';

import CondicaoPagamentoList from '../CondicaoPagamento/CondicaoPagamentoListMUI';
import CondicaoPagamentoForm from '../CondicaoPagamento/CondicaoPagamentoFormMUI';

import FormaPagamentoList from '../FormaPagamento/FormaPagamentoListMUI';
import FormaPagamentoForm from '../FormaPagamento/FormaPagamentoFormMUI';

import ProdutoList from '../Produto/ProdutoList';
import ProdutoForm from '../Produto/ProdutoForm';

import CidadeListMUI from '../Cidade/CidadeListMUI';
import CidadeFormMUI from '../Cidade/CidadeFormMUI';

import PaisList from '../Pais/PaisListMUI';
import PaisForm from '../Pais/PaisFormMUI';

import EstadoListMUI from '../Estado/EstadoListMUI';
import EstadoFormMUI from '../Estado/EstadoFormMUI';
import EstadoModal from '../Estado/EstadoModal';
import EstadoFormModal from '../Estado/EstadoFormModal';

const MainContent = () => {
  return (
    <main>      
    <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClienteList />} />
        <Route path="/clientes/cadastrar" element={<ClienteForm />} />
        <Route path="/clientes/editar/:id" element={<ClienteForm />} />

        <Route path="/fornecedores" element={<FornecedorList />} />
        <Route path="/fornecedores/cadastrar" element={<FornecedorForm />} />
        <Route path="/fornecedores/editar/:id" element={<FornecedorForm />} />

        <Route path="/funcionarios" element={<FuncionarioList />} />
        <Route path="/funcionarios/cadastrar" element={<FuncionarioForm />} />
        <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />

        <Route path="/funcoes-funcionario" element={<FuncaoFuncionarioList />} />
        <Route path="/funcoes-funcionario/cadastrar" element={<FuncaoFuncionarioForm />} />
        <Route path="/funcoes-funcionario/editar/:id" element={<FuncaoFuncionarioForm />} />

        <Route path="/formas-pagamento" element={<FormaPagamentoList />} />
        <Route path="/formas-pagamento/cadastrar" element={<FormaPagamentoForm />} />
        <Route path="/formas-pagamento/editar/:id" element={<FormaPagamentoForm />} />

        <Route path="/condicoes-pagamento" element={<CondicaoPagamentoList />} />
        <Route path="/condicoes-pagamento/cadastrar" element={<CondicaoPagamentoForm />} />
        <Route path="/condicoes-pagamento/editar/:id" element={<CondicaoPagamentoForm />} />

        <Route path="/produtos" element={<ProdutoList />} />
        <Route path="/produtos/cadastrar" element={<ProdutoForm />} />
        <Route path="/produtos/editar/:id" element={<ProdutoForm />} />

        <Route path="/cidades" element={<CidadeListMUI />} />
        <Route path="/cidades/cadastrar" element={<CidadeFormMUI />} />
        <Route path="/cidades/editar/:id" element={<CidadeFormMUI />} />

        <Route path="/paises" element={<PaisList />} />
        <Route path="/paises/cadastrar" element={<PaisForm />} />
        <Route path="/paises/editar/:id" element={<PaisForm />} />

        <Route path="/estados" element={<EstadoListMUI />} />
        <Route path="/estados/cadastrar" element={<EstadoFormMUI />} />
        <Route path="/estados/editar/:id" element={<EstadoFormMUI />} />
      </Routes>
    </main>
  );
};


export default MainContent;