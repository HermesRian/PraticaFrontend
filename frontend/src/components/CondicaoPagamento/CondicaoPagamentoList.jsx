import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CondicaoPagamentoList = () => {
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [condicaoSelecionada, setCondicaoSelecionada] = useState(null); // Condição selecionada para visualização
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal

  useEffect(() => {
    // Buscar condições de pagamento
    fetch('http://localhost:8080/condicoes-pagamento')
      .then((response) => response.json())
      .then((data) => setCondicoesPagamento(data))
      .catch((error) => console.error('Erro ao buscar condições de pagamento:', error));
  }, []);

  const handleViewParcelas = (condicao) => {
    setCondicaoSelecionada(condicao);
    setParcelas(condicao.parcelasCondicao || []); // Parcelas já vêm aninhadas no JSON
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCondicaoSelecionada(null);
    setParcelas([]);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta condição de pagamento?')) {
      fetch(`http://localhost:8080/condicoes-pagamento/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            setCondicoesPagamento(condicoesPagamento.filter((condicao) => condicao.id !== id));
          } else {
            console.error('Erro ao excluir condição de pagamento:', response.statusText);
          }
        })
        .catch((error) => console.error('Erro ao excluir condição de pagamento:', error));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Condições de Pagamento</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link
          to="/condicoes-pagamento/cadastrar"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Cadastrar Nova Condição de Pagamento
        </Link>
      </div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descrição</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Juros (%)</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Multa (%)</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Desconto (%)</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ativo</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {condicoesPagamento.map((condicao) => (
            <tr key={condicao.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{condicao.descricao}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{condicao.jurosPercentual}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{condicao.multaPercentual}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{condicao.descontoPercentual}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {condicao.ativo ? 'Sim' : 'Não'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleViewParcelas(condicao)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#17a2b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Visualizar Parcelas
                </button>
                <Link
                  to={`/condicoes-pagamento/editar/${condicao.id}`}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '3px',
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(condicao.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de visualização de parcelas */}
      {isModalOpen && condicaoSelecionada && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              width: '500px',
              maxHeight: '80%',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
              Parcelas - {condicaoSelecionada.descricao}
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Número</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dias</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Percentual (%)</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Forma de Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((parcela, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{parcela.numeroParcela}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{parcela.dias}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{parcela.percentual}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {parcela.formaPagamento?.descricao || 'Desconhecida'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleCloseModal}
              style={{
                display: 'block',
                margin: '20px auto 0',
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CondicaoPagamentoList;