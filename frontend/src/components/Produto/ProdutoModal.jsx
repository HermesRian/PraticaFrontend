import React from 'react';
import SelectOrCreateModal from '../common/SelectOrCreateModal';
import ProdutoFormMUI from './ProdutoFormMUI';

/**
 * Modal para selecionar ou criar produto usando o componente genérico
 */
const ProdutoModal = ({ open, onClose, onSelect }) => {
  // Função que busca produtos do backend
  const fetchProdutos = async () => {
    const response = await fetch('http://localhost:8080/produtos');
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }
    return response.json();
  };

  // Função que filtra produtos baseado no termo de busca
  const filterProdutos = (produtos, searchTerm) => {
    if (!searchTerm) return produtos;
    
    const term = searchTerm.toLowerCase();
    return produtos.filter(produto =>
      produto.nome?.toLowerCase().includes(term) ||
      produto.codigo?.toLowerCase().includes(term) ||
      produto.categoriaDescricao?.toLowerCase().includes(term) ||
      produto.marcaDescricao?.toLowerCase().includes(term)
    );
  };

  // Função que renderiza as células de cada linha
  const renderRow = (produto) => [
    produto.codigo || '-',
    produto.nome,
    produto.categoriaDescricao || '-',
    produto.marcaDescricao || '-',
    produto.unidadeMedidaDescricao || '-',
    produto.valorVenda ? `R$ ${Number(produto.valorVenda).toFixed(2)}` : '-'
  ];

  // Definição das colunas da tabela
  const columns = [
    { label: 'Código', minWidth: 100 },
    { label: 'Nome', minWidth: 200 },
    { label: 'Categoria', minWidth: 150 },
    { label: 'Marca', minWidth: 150 },
    { label: 'Unidade', minWidth: 100 },
    { label: 'Valor', minWidth: 120 }
  ];

  return (
    <SelectOrCreateModal
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Selecionar Produto"
      fetchItems={fetchProdutos}
      renderRow={renderRow}
      columns={columns}
      filterItems={filterProdutos}
      CreateFormModal={ProdutoFormMUI}
      createFormProps={{ isModal: true }}
    />
  );
};

export default ProdutoModal;
