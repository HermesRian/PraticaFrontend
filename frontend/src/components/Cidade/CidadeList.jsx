import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CidadeList = () => {
  const [cidades, setCidades] = useState([]);
  const [estados, setEstados] = useState({});
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null); // Cidade selecionada para visualização
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Controle do popup
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Configuração de ordenação
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar cidades
    fetch('http://localhost:8080/cidades')
      .then((response) => response.json())
      .then((data) => setCidades(data))
      .catch((error) => console.error('Erro ao buscar cidades:', error));

    // Buscar estados
    fetch('http://localhost:8080/estados')
      .then((response) => response.json())
      .then((data) => {
        const estadosMap = {};
        data.forEach((estado) => {
          estadosMap[estado.id] = estado.nome;
        });
        setEstados(estadosMap);
      })
      .catch((error) => console.error('Erro ao buscar estados:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      fetch(`http://localhost:8080/cidades/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setCidades(cidades.filter((cidade) => cidade.id !== id));
        })
        .catch((error) => console.error('Erro ao excluir cidade:', error));
    }
  };

  // Função para ordenar os dados
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCidades = [...cidades].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para a coluna "Estado", usamos o nome do estado
      if (key === 'estado') {
        aValue = estados[a.estadoId] || 'Desconhecido';
        bValue = estados[b.estadoId] || 'Desconhecido';
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setCidades(sortedCidades);
  };

  // Função para abrir o popup de visualização
  const handleView = (cidade) => {
    setCidadeSelecionada(cidade);
    setIsPopupOpen(true);
  };

  // Função para fechar o popup
  const handleClosePopup = () => {
    setCidadeSelecionada(null);
    setIsPopupOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Lista de Cidades</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link
          to="/cidades/cadastrar"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Cadastrar Nova Cidade
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
              onClick={() => handleSort('estado')}
            >
              Estado {sortConfig.key === 'estado' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cidades.map((cidade) => (
            <tr key={cidade.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{cidade.nome}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {estados[cidade.estadoId] || 'Desconhecido'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleView(cidade)}
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
                  to={`/cidades/editar/${cidade.id}`}
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
                  onClick={() => handleDelete(cidade.id)}
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
      {isPopupOpen && cidadeSelecionada && (
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
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Detalhes da Cidade</h2>
            <p><strong>Nome:</strong> {cidadeSelecionada.nome}</p>
            <p><strong>Estado:</strong> {estados[cidadeSelecionada.estadoId] || 'Desconhecido'}</p>
            <p><strong>Código IBGE:</strong> {cidadeSelecionada.codigoIbge || 'Não informado'}</p>
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

export default CidadeList;