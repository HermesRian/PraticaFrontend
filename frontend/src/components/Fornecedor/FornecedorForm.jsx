import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CidadeModal from '../Cidade/CidadeModal';

const FornecedorForm = () => {
  const [fornecedor, setFornecedor] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    cidadeNome: 'Selecione uma Cidade',
    ativo: true, // Switch de ativo
  });

  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/fornecedores/${id}`)
        .then((response) => response.json())
        .then((data) =>
          setFornecedor({
            ...data,
            cidadeNome: data.cidadeNome || 'Selecione uma Cidade',
          })
        )
        .catch((error) => console.error('Erro ao buscar fornecedor:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFornecedor({ ...fornecedor, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/fornecedores/${id}` : 'http://localhost:8080/fornecedores';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fornecedor),
    })
      .then((response) => {
        if (!response.ok) {
          // Captura a mensagem de erro específica do backend
          return response.json().then((error) => {
            if (error && error.erro) {
              throw new Error(error.erro); // Usa a mensagem do backend
            }
            throw new Error('Erro ao salvar fornecedor.'); // Fallback genérico
          });
        }
        return response.json();
      })
      .then(() => {
        navigate('/fornecedores');
      })
      .catch((error) => {
        // Define a mensagem de erro retornada pelo backend
        setErrorMessage(error.message);
      });
  };

  const handleCancel = () => {
    navigate('/fornecedores');
  };

  const handleOpenCidadeModal = () => {
    setIsCidadeModalOpen(true);
  };

  const handleCloseCidadeModal = () => {
    setIsCidadeModalOpen(false);
  };

  const handleCidadeSelecionada = (cidade) => {
    setFornecedor({ ...fornecedor, cidadeId: cidade.id, cidadeNome: cidade.nome });
    setIsCidadeModalOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'relative', 
        }}
      >
        <div
          style={{
            gridColumn: '1 / -1', 
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '10px', 
          }}
        >
          <label style={{ marginRight: '10px' }}>Ativo:</label>
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '40px',
              height: '20px',
            }}
          >
            <input
              type="checkbox"
              name="ativo"
              checked={fornecedor.ativo}
              onChange={handleChange}
              style={{
                opacity: 0,
                width: 0,
                height: 0,
              }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: fornecedor.ativo ? '#007BFF' : '#ccc',
                borderRadius: '20px',
                transition: '0.4s',
              }}
            ></span>
            <span
              style={{
                position: 'absolute',
                content: '',
                height: '14px',
                width: '14px',
                left: fornecedor.ativo ? '22px' : '4px',
                bottom: '3px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                transition: '0.4s',
              }}
            ></span>
          </label>
        </div>

        {/* Campos do formulário */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>
            Razão Social <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            name="razaoSocial"
            value={fornecedor.razaoSocial}
            onChange={handleChange}
            placeholder="ex. Empresa XYZ Ltda"
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Nome Fantasia</label>
          <input
            type="text"
            name="nomeFantasia"
            value={fornecedor.nomeFantasia}
            onChange={handleChange}
            placeholder="ex. Loja XYZ"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>
            CNPJ <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            name="cnpj"
            value={fornecedor.cnpj}
            onChange={handleChange}
            placeholder="ex. 12.345.678/0001-00"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          {/* Exibe a mensagem de erro apenas abaixo do campo */}
          {errorMessage && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginTop: '5px' }}>
              {errorMessage}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Inscrição Estadual</label>
          <input
            type="text"
            name="inscricaoEstadual"
            value={fornecedor.inscricaoEstadual}
            onChange={handleChange}
            placeholder="ex. 123456789"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={fornecedor.email}
            onChange={handleChange}
            placeholder="ex. contato@empresa.com"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Telefone</label>
          <input
            type="text"
            name="telefone"
            value={fornecedor.telefone}
            onChange={handleChange}
            placeholder="ex. (11) 91234-5678"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={fornecedor.endereco}
            onChange={handleChange}
            placeholder="ex. Rua das Flores"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Número</label>
          <input
            type="text"
            name="numero"
            value={fornecedor.numero}
            onChange={handleChange}
            placeholder="ex. 123"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Complemento</label>
          <input
            type="text"
            name="complemento"
            value={fornecedor.complemento}
            onChange={handleChange}
            placeholder="ex. Apto 101"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Bairro</label>
          <input
            type="text"
            name="bairro"
            value={fornecedor.bairro}
            onChange={handleChange}
            placeholder="ex. Centro"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>CEP</label>
          <input
            type="text"
            name="cep"
            value={fornecedor.cep}
            onChange={handleChange}
            placeholder="ex. 12345-678"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={fornecedor.cidadeNome}
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
            onClick={handleOpenCidadeModal}
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

        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '10px',
          }}
        >
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

      {/* Modal de seleção de cidades */}
      {isCidadeModalOpen && (
        <CidadeModal
          onClose={handleCloseCidadeModal}
          onCidadeSelecionada={handleCidadeSelecionada}
        />
      )}
    </div>
  );
};

export default FornecedorForm;