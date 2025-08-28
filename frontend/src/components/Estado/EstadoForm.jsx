import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PaisModal from '../Pais/PaisModal'; // Modal de seleção de países

const EstadoForm = () => {
  const [estado, setEstado] = useState({
    nome: '',
    uf: '',
    paisId: '',
    paisNome: 'Selecione um País', // Nome do país selecionado
  });

  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false); // Controle do modal de seleção de países
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Buscar estado se estiver editando
    if (id) {
      fetch(`http://localhost:8080/estados/${id}`)
        .then((response) => response.json())
        .then((data) =>
          setEstado({
            ...data,
            paisNome: data.paisNome || 'Selecione um País',
          })
        )
        .catch((error) => console.error('Erro ao buscar estado:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEstado({ ...estado, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/estados/${id}` : 'http://localhost:8080/estados';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estado),
    })
      .then(() => {
        setEstado({
          nome: '',
          uf: '',
          paisId: '',
          paisNome: 'Selecione um País',
        });
        navigate('/estados');
      })
      .catch((error) => console.error('Erro ao salvar estado:', error));
  };

  const handleCancel = () => {
    navigate('/estados');
  };

  const handleOpenPaisModal = () => {
    setIsPaisModalOpen(true);
  };

  const handleClosePaisModal = () => {
    setIsPaisModalOpen(false);
  };

  const handlePaisSelecionado = (pais) => {
    setEstado({ ...estado, paisId: pais.id, paisNome: pais.nome });
    setIsPaisModalOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar Estado' : 'Cadastrar Novo Estado'}
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
          value={estado.nome}
          onChange={handleChange}
          placeholder="Nome do Estado"
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
          name="uf"
          value={estado.uf}
          onChange={handleChange}
          placeholder="UF (Ex: SP)"
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
            value={estado.paisNome}
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
            onClick={handleOpenPaisModal}
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

      {/* Modal de seleção de países */}
      {isPaisModalOpen && (
        <PaisModal
          onClose={handleClosePaisModal}
          onPaisSelecionado={handlePaisSelecionado}
        />
      )}
    </div>
  );
};

export default EstadoForm;