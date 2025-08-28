import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaisForm = () => {
  const [pais, setPais] = useState({
    nome: '',
    sigla: '',
    codigo: '', // Adicionado para armazenar o código do país
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/paises/${id}`)
        .then((response) => response.json())
        .then((data) => setPais(data))
        .catch((error) => console.error('Erro ao buscar país:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPais({ ...pais, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/paises/${id}` : 'http://localhost:8080/paises';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pais),
    })
      .then((response) => response.json())
      .then(() => {
        setPais({
          nome: '',
          sigla: '',
          codigo: '',
        });
        navigate('/paises');
      })
      .catch((error) => console.error('Erro ao salvar país:', error));
  };

  const handleCancel = () => {
    navigate('/paises');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar País' : 'Cadastrar Novo País'}
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
          value={pais.nome}
          onChange={handleChange}
          placeholder="Nome do País"
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
          name="sigla"
          value={pais.sigla}
          onChange={handleChange}
          placeholder="Sigla (Ex: BR)"
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
          name="codigo"
          value={pais.codigo}
          onChange={handleChange}
          placeholder="Código do País"
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
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
    </div>
  );
};

export default PaisForm;