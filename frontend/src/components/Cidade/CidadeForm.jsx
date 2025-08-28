import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EstadoModal from '../Estado/EstadoModal'; // Modal de seleção de estados

const CidadeForm = () => {
  const [cidade, setCidade] = useState({
    nome: '',
    codigoIbge: '',
    estadoId: '',
    estadoNome: 'Selecione um Estado', // Nome do estado selecionado
  });

  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false); // Controle do modal de seleção de estados
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/cidades/${id}`)
        .then((response) => response.json())
        .then((data) => setCidade({ ...data, estadoNome: data.estadoNome || 'Selecione um Estado' }))
        .catch((error) => console.error('Erro ao buscar cidade:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCidade({ ...cidade, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/cidades/${id}` : 'http://localhost:8080/cidades';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cidade),
    })
      .then(() => {
        setCidade({
          nome: '',
          codigoIbge: '',
          estadoId: '',
          estadoNome: 'Selecione um Estado',
        });
        navigate('/cidades');
      })
      .catch((error) => console.error('Erro ao salvar cidade:', error));
  };

  const handleCancel = () => {
    navigate('/cidades');
  };

  const handleOpenEstadoModal = () => {
    setIsEstadoModalOpen(true);
  };

  const handleCloseEstadoModal = () => {
    setIsEstadoModalOpen(false);
  };

  const handleEstadoSelecionado = (estado) => {
    setCidade({ ...cidade, estadoId: estado.id, estadoNome: `${estado.nome} - ${estado.uf}` });
    setIsEstadoModalOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar Cidade' : 'Cadastrar Nova Cidade'}
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="text"
          name="nome"
          value={cidade.nome}
          onChange={handleChange}
          placeholder="Nome"
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <input
          type="text"
          name="codigoIbge"
          value={cidade.codigoIbge}
          onChange={handleChange}
          placeholder="Código IBGE"
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={cidade.estadoNome}
            disabled
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: '#f2f2f2',
              color: '#555',
            }}
          />
          <button
            type="button"
            onClick={handleOpenEstadoModal}
            style={{
              padding: '10px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            🔍
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '10px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Salvar
          </button>
        </div>
      </form>

      {/* Modal de seleção de estados */}
      {isEstadoModalOpen && (
        <EstadoModal
          onClose={handleCloseEstadoModal}
          onEstadoSelecionado={handleEstadoSelecionado}
        />
      )}
    </div>
  );
};

export default CidadeForm;