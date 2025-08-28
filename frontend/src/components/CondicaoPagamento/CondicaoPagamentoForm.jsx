import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CondicaoPagamentoForm = () => {
  const [condicaoPagamento, setCondicaoPagamento] = useState({
    descricao: '',
    dias: '',
    parcelas: [],
    juros_percentual: '',
    multa_percentual: '',
    desconto_percentual: '',
    ativo: true,
  });

  const [formasPagamento, setFormasPagamento] = useState([]);
  const [numeroParcelas, setNumeroParcelas] = useState('');
  const [erroPercentual, setErroPercentual] = useState(false); 
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetch('http://localhost:8080/formas-pagamento')
      .then((response) => response.json())
      .then((data) => setFormasPagamento(data))
      .catch((error) => console.error('Erro ao buscar formas de pagamento:', error));

    if (id) {
      fetch(`http://localhost:8080/condicoes-pagamento/${id}`)
        .then((response) => response.json())
        .then((data) => {
          const condicaoPagamentoComValoresPadrao = {
            descricao: data.descricao || '',
            dias: data.dias || '',
            parcelas: (data.parcelasCondicao || []).map((parcela) => ({
              numero_parcela: parcela.numeroParcela || '',
              dias: parcela.dias || '',
              percentual: parcela.percentual || '',
              forma_pagamento_id: parcela.formaPagamento?.id || '',
            })),
            juros_percentual: data.jurosPercentual || '',
            multa_percentual: data.multaPercentual || '',
            desconto_percentual: data.descontoPercentual || '',
            ativo: data.ativo ?? true,
          };
          setCondicaoPagamento(condicaoPagamentoComValoresPadrao);
        })
        .catch((error) => console.error('Erro ao buscar condição de pagamento:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCondicaoPagamento({ ...condicaoPagamento, [name]: type === 'checkbox' ? checked : value });
  };

  const handleGerarParcelas = () => {
    const parcelasGeradas = Array.from({ length: parseInt(numeroParcelas, 10) || 0 }, (_, index) => ({
      numero_parcela: index + 1,
      dias: '',
      percentual: '',
      forma_pagamento_id: '',
    }));
    setCondicaoPagamento({ ...condicaoPagamento, parcelas: parcelasGeradas });
  };

  const handleParcelaChange = (index, field, value) => {
    const parcelasAtualizadas = condicaoPagamento.parcelas.map((parcela, i) =>
      i === index ? { ...parcela, [field]: value } : parcela
    );
    setCondicaoPagamento({ ...condicaoPagamento, parcelas: parcelasAtualizadas });
  };

  const calcularSomaPercentuais = () => {
    return condicaoPagamento.parcelas.reduce((soma, parcela) => soma + parseFloat(parcela.percentual || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const diasCondicao = parseInt(condicaoPagamento.dias, 10) || 0;
    const parcelasInvalidas = condicaoPagamento.parcelas.some(
      (parcela) => parseInt(parcela.dias, 10) > diasCondicao
    );
  
    if (parcelasInvalidas) {
      alert('Os dias das parcelas não podem exceder o prazo total da condição de pagamento.');
      return;
    }
  
    const somaPercentuais = calcularSomaPercentuais();
    if (somaPercentuais !== 100) {
      setErroPercentual(true);
      return;
    }
    setErroPercentual(false);
  
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `http://localhost:8080/condicoes-pagamento/${id}`
      : 'http://localhost:8080/condicoes-pagamento';
  
    const payload = {
      descricao: condicaoPagamento.descricao,
      dias: parseInt(condicaoPagamento.dias, 10) || 0,
      parcelas: condicaoPagamento.parcelas.length,
      ativo: condicaoPagamento.ativo,
      jurosPercentual: parseFloat(condicaoPagamento.juros_percentual) || 0,
      multaPercentual: parseFloat(condicaoPagamento.multa_percentual) || 0,
      descontoPercentual: parseFloat(condicaoPagamento.desconto_percentual) || 0,
      parcelasCondicao: condicaoPagamento.parcelas.map((parcela) => ({
        numeroParcela: parseInt(parcela.numero_parcela, 10) || 0,
        dias: parseInt(parcela.dias, 10) || 0,
        percentual: parseFloat(parcela.percentual) || 0,
        formaPagamento: { id: parseInt(parcela.forma_pagamento_id, 10) || null },
      })),
    };
  
    console.log('Payload enviado:', payload);
  
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            console.error('Erro do backend:', error);
            throw new Error('Erro ao salvar condição de pagamento');
          });
        }
        navigate('/condicoes-pagamento');
      })
      .catch((error) => console.error('Erro ao salvar condição de pagamento:', error));
  };

  const handleCancel = () => {
    navigate('/condicoes-pagamento');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? 'Editar Condição de Pagamento' : 'Cadastrar Nova Condição de Pagamento'}
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '600px',
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
          value={condicaoPagamento.descricao || ''}
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
          type="number"
          name="dias"
          value={condicaoPagamento.dias || ''}
          onChange={handleChange}
          placeholder="Dias"
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <input
          type="number"
          name="juros_percentual"
          value={condicaoPagamento.juros_percentual || ''}
          onChange={handleChange}
          placeholder="Juros (%)"
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <input
          type="number"
          name="multa_percentual"
          value={condicaoPagamento.multa_percentual || ''}
          onChange={handleChange}
          placeholder="Multa (%)"
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />
        <input
          type="number"
          name="desconto_percentual"
          value={condicaoPagamento.desconto_percentual || ''}
          onChange={handleChange}
          placeholder="Desconto (%)"
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        />

        <h3>Parcelas</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            value={numeroParcelas}
            onChange={(e) => setNumeroParcelas(e.target.value)}
            placeholder="Número de Parcelas"
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              flex: 1,
            }}
          />
          <button
            type="button"
            onClick={handleGerarParcelas}
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Gerar Parcelas
          </button>
        </div>

        {condicaoPagamento.parcelas &&
          Array.isArray(condicaoPagamento.parcelas) &&
          condicaoPagamento.parcelas.map((parcela, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="number"
                value={parcela.numero_parcela || ''}
                onChange={(e) => handleParcelaChange(index, 'numero_parcela', e.target.value)}
                placeholder="Número da Parcela"
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  flex: 1,
                }}
              />
              <input
                type="number"
                value={parcela.dias || ''}
                onChange={(e) => handleParcelaChange(index, 'dias', e.target.value)}
                placeholder="Dias"
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  flex: 1,
                }}
              />
              <input
                type="number"
                value={parcela.percentual || ''}
                onChange={(e) => handleParcelaChange(index, 'percentual', e.target.value)}
                placeholder="Percentual (%)"
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  flex: 1,
                }}
              />
              <select
                value={parcela.forma_pagamento_id || ''}
                onChange={(e) => handleParcelaChange(index, 'forma_pagamento_id', e.target.value)}
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  flex: 1,
                }}
              >
                <option value="">Forma de Pagamento</option>
                {formasPagamento.map((forma) => (
                  <option key={forma.id} value={forma.id}>
                    {forma.descricao}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {erroPercentual && (
          <p style={{ color: 'red' }}>A soma dos percentuais deve ser igual a 100%.</p>
        )}

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

export default CondicaoPagamentoForm;