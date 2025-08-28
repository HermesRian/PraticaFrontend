import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaisList = () => {
  const [paises, setPaises] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState(null); // País selecionado para visualização
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Controle do popup
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Configuração de ordenação

  useEffect(() => {
    fetch('http://localhost:8080/paises')
      .then((response) => response.json())
      .then((data) => setPaises(data))
      .catch((error) => console.error('Erro ao buscar países:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este país?')) {
      fetch(`http://localhost:8080/paises/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setPaises(paises.filter((pais) => pais.id !== id));
        })
        .catch((error) => console.error('Erro ao excluir país:', error));
    }
  };

  // Função para ordenar os dados
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedPaises = [...paises].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setPaises(sortedPaises);
  };

  // Função para abrir o popup de visualização
  const handleView = (pais) => {
    setPaisSelecionado(pais);
    setIsPopupOpen(true);
  };

  // Função para fechar o popup
  const handleClosePopup = () => {
    setPaisSelecionado(null);
    setIsPopupOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Lista de Países</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link
          to="/paises/cadastrar"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Cadastrar Novo País
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
              onClick={() => handleSort('nome')}
            >
              Nome {sortConfig.key === 'nome' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('codigo')}
            >
              Código {sortConfig.key === 'codigo' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('sigla')}
            >
              Sigla {sortConfig.key === 'sigla' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paises.map((pais) => (
            <tr key={pais.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pais.nome}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pais.codigo}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{pais.sigla}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleView(pais)}
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
                  to={`/paises/editar/${pais.id}`}
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
                  onClick={() => handleDelete(pais.id)}
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
      {isPopupOpen && paisSelecionado && (
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
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Detalhes do País</h2>
            <p><strong>Nome:</strong> {paisSelecionado.nome}</p>
            <p><strong>Código:</strong> {paisSelecionado.codigo}</p>
            <p><strong>Sigla:</strong> {paisSelecionado.sigla}</p>
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

export default PaisList;