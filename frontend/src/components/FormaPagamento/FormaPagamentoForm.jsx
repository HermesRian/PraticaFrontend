import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const FormaPagamentoForm = () => {
  const [formaPagamento, setFormaPagamento] = useState({
    descricao: '',
    codigo: '',
    tipo: '',
    ativo: true,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/formas-pagamento/${id}`)
        .then((response) => response.json())
        .then((data) => setFormaPagamento(data))
        .catch((error) => console.error('Erro ao buscar forma de pagamento:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormaPagamento({ ...formaPagamento, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `http://localhost:8080/formas-pagamento/${id}`
      : 'http://localhost:8080/formas-pagamento';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formaPagamento),
    })
      .then(() => {
        setFormaPagamento({
          descricao: '',
          codigo: '',
          tipo: '',
          ativo: true,
        });
        navigate('/formas-pagamento');
      })
      .catch((error) => console.error('Erro ao salvar forma de pagamento:', error));
  };

  const handleCancel = () => {
    navigate('/formas-pagamento');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar Forma de Pagamento' : 'Cadastrar Nova Forma de Pagamento'}
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
          name="descricao"
          value={formaPagamento.descricao}
          onChange={handleChange}
          placeholder="Descrição"
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
          value={formaPagamento.codigo}
          onChange={handleChange}
          placeholder="Código"
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
          name="tipo"
          value={formaPagamento.tipo}
          onChange={handleChange}
          placeholder="Tipo"
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Ativo:</span>
          <input
            type="checkbox"
            name="ativo"
            checked={formaPagamento.ativo}
            onChange={handleChange}
            style={{ transform: 'scale(1.2)' }}
          />
        </label>
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

export default FormaPagamentoForm;