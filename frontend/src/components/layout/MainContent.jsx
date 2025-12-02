import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';

import ClienteList from '../Cliente/ClienteListMUI';
import ClienteForm from '../Cliente/ClienteFormMUI';

import FornecedorList from '../Fornecedor/FornecedorListMUI';
import FornecedorForm from '../Fornecedor/FornecedorFormMUI';

import TransportadoraList from '../Transportadora/TransportadoraListMUI';
import TransportadoraForm from '../Transportadora/TransportadoraFormMUI';

import FuncionarioList from '../Funcionario/FuncionarioListMUI';
import FuncionarioForm from '../Funcionario/FuncionarioFormMUI';

import FuncaoFuncionarioList from '../FuncaoFuncionario/FuncaoFuncionarioListMUI';
import FuncaoFuncionarioForm from '../FuncaoFuncionario/FuncaoFuncionarioFormMUI';

import CondicaoPagamentoList from '../CondicaoPagamento/CondicaoPagamentoListMUI';
import CondicaoPagamentoForm from '../CondicaoPagamento/CondicaoPagamentoFormMUI';

import FormaPagamentoList from '../FormaPagamento/FormaPagamentoListMUI';
import FormaPagamentoForm from '../FormaPagamento/FormaPagamentoFormMUI';

import ProdutoList from '../Produto/ProdutoListMUI';
import ProdutoForm from '../Produto/ProdutoFormMUI';

import CidadeListMUI from '../Cidade/CidadeListMUI';
import CidadeFormMUI from '../Cidade/CidadeFormMUI';

import PaisList from '../Pais/PaisListMUI';
import PaisForm from '../Pais/PaisFormMUI';

import EstadoListMUI from '../Estado/EstadoListMUI';
import EstadoFormMUI from '../Estado/EstadoFormMUI';
import EstadoModal from '../Estado/EstadoModal';
import EstadoFormModal from '../Estado/EstadoFormModal';

import CategoriaListMUI from '../Categoria/CategoriaListMUI';
import CategoriaFormMUI from '../Categoria/CategoriaFormMUI';

import UnidadeMedidaListMUI from '../UnidadeMedida/UnidadeMedidaListMUI';

import NotaEntradaListMUI from '../NotaEntrada/NotaEntradaListMUI';
import NotaEntradaFormMUI from '../NotaEntrada/NotaEntradaFormMUI';

import NotaSaidaListMUI from '../NotaSaida/NotaSaidaListMUI';
import NotaSaidaFormMUI from '../NotaSaida/NotaSaidaFormMUI';

import ContaPagarListMUI from '../ContaPagar/ContaPagarListMUI';
import ContaReceberListMUI from '../ContaReceber/ContaReceberListMUI';

const MainContent = () => {
  return (
    <main>      
    <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClienteList />} />

        <Route path="/fornecedores" element={<FornecedorList />} />
        <Route path="/fornecedores/cadastrar" element={<FornecedorForm />} />
        <Route path="/fornecedores/editar/:id" element={<FornecedorForm />} />

        <Route path="/transportadoras" element={<TransportadoraList />} />
        <Route path="/transportadoras/novo" element={<TransportadoraForm />} />
        <Route path="/transportadoras/:id/editar" element={<TransportadoraForm />} />

        <Route path="/funcionarios" element={<FuncionarioList />} />
        <Route path="/funcionarios/cadastrar" element={<FuncionarioForm />} />
        <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />

        <Route path="/funcoes-funcionario" element={<FuncaoFuncionarioList />} />
        <Route path="/funcoes-funcionario/cadastrar" element={<FuncaoFuncionarioForm />} />
        <Route path="/funcoes-funcionario/editar/:id" element={<FuncaoFuncionarioForm />} />

        <Route path="/formas-pagamento" element={<FormaPagamentoList />} />

        <Route path="/condicoes-pagamento" element={<CondicaoPagamentoList />} />
        <Route path="/condicoes-pagamento/cadastrar" element={<CondicaoPagamentoForm />} />
        <Route path="/condicoes-pagamento/editar/:id" element={<CondicaoPagamentoForm />} />

        <Route path="/produtos" element={<ProdutoList />} />
        <Route path="/produtos/cadastrar" element={<ProdutoForm />} />
        <Route path="/produtos/editar/:id" element={<ProdutoForm />} />

        <Route path="/cidades" element={<CidadeListMUI />} />

        <Route path="/paises" element={<PaisList />} />
        <Route path="/paises/cadastrar" element={<PaisForm />} />
        <Route path="/paises/editar/:id" element={<PaisForm />} />

        <Route path="/estados" element={<EstadoListMUI />} />
        <Route path="/estados/cadastrar" element={<EstadoFormMUI />} />
        <Route path="/estados/editar/:id" element={<EstadoFormMUI />} />

        <Route path="/categorias" element={<CategoriaListMUI />} />
        <Route path="/categorias/cadastrar" element={<CategoriaFormMUI />} />
        <Route path="/categorias/editar/:id" element={<CategoriaFormMUI />} />

        {/* Unidades de Medida */}
        <Route path="/unidades-medida" element={<UnidadeMedidaListMUI />} />

        {/* Notas de Entrada */}
        <Route path="/notas-entrada" element={<NotaEntradaListMUI />} />
        <Route path="/notas-entrada/cadastrar" element={<NotaEntradaFormMUI />} />
        <Route path="/notas-entrada/editar/:id" element={<NotaEntradaFormMUI />} />

        {/* Notas de Saída */}
        <Route path="/notas-saida" element={<NotaSaidaListMUI />} />
        <Route path="/notas-saida/cadastrar" element={<NotaSaidaFormMUI />} />
        <Route path="/notas-saida/editar/:id" element={<NotaSaidaFormMUI />} />

        {/* Contas a Pagar */}
        <Route path="/contas-pagar" element={<ContaPagarListMUI />} />

        {/* Contas a Receber */}
        <Route path="/contas-receber" element={<ContaReceberListMUI />} />
      </Routes>
    </main>
  );
};


export default MainContent;