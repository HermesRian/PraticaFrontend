import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FormaPagamentoList = () => {
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [formaSelecionada, setFormaSelecionada] = useState(null); // Forma de pagamento selecionada para visualização
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Controle do popup
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Configuração de ordenação

  useEffect(() => {
    fetch('http://localhost:8080/formas-pagamento')
      .then((response) => response.json())
      .then((data) => setFormasPagamento(data))
      .catch((error) => console.error('Erro ao buscar formas de pagamento:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      fetch(`http://localhost:8080/formas-pagamento/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setFormasPagamento(formasPagamento.filter((forma) => forma.id !== id));
        })
        .catch((error) => console.error('Erro ao excluir forma de pagamento:', error));
    }
  };

  // Função para ordenar os dados
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFormasPagamento = [...formasPagamento].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para a coluna "Ativo", convertemos para valores booleanos
      if (key === 'ativo') {
        aValue = a.ativo ? 1 : 0;
        bValue = b.ativo ? 1 : 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setFormasPagamento(sortedFormasPagamento);
  };

  // Função para abrir o popup de visualização
  const handleView = (forma) => {
    setFormaSelecionada(forma);
    setIsPopupOpen(true);
  };

  // Função para fechar o popup
  const handleClosePopup = () => {
    setFormaSelecionada(null);
    setIsPopupOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Lista de Formas de Pagamento</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link
          to="/formas-pagamento/cadastrar"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Cadastrar Nova Forma de Pagamento
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
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('descricao')}
            >
              Descrição {sortConfig.key === 'descricao' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('ativo')}
            >
              Ativo {sortConfig.key === 'ativo' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {formasPagamento.map((forma) => (
            <tr key={forma.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{forma.descricao}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {forma.ativo ? 'Sim' : 'Não'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleView(forma)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#17a2b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Visualizar
                </button>
                <Link
                  to={`/formas-pagamento/editar/${forma.id}`}
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
                  onClick={() => handleDelete(forma.id)}
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

      {/* Popup de visualização */}
      {isPopupOpen && formaSelecionada && (
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
              width: '400px',
              maxHeight: '80%',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Detalhes da Forma de Pagamento</h2>
            <p><strong>Descrição:</strong> {formaSelecionada.descricao}</p>
            <p><strong>Código:</strong> {formaSelecionada.codigo || 'Não informado'}</p>
            <p><strong>Tipo:</strong> {formaSelecionada.tipo || 'Não informado'}</p>
            <p><strong>Ativo:</strong> {formaSelecionada.ativo ? 'Sim' : 'Não'}</p>
            <button
              onClick={handleClosePopup}
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

export default FormaPagamentoList;