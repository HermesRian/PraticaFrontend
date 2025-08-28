import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FuncionarioList = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null); // Funcionário selecionado para visualização
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Controle do popup
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Configuração de ordenação
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar funcionários
    fetch('http://localhost:8080/funcionarios')
      .then((response) => response.json())
      .then((data) => setFuncionarios(data))
      .catch((error) => console.error('Erro ao buscar funcionários:', error));

    // Buscar cidades
    fetch('http://localhost:8080/cidades')
      .then((response) => response.json())
      .then((data) => setCidades(data))
      .catch((error) => console.error('Erro ao buscar cidades:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      fetch(`http://localhost:8080/funcionarios/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setFuncionarios(funcionarios.filter((funcionario) => funcionario.id !== id));
        })
        .catch((error) => console.error('Erro ao excluir funcionário:', error));
    }
  };

  const getCidadeNome = (cidadeId) => {
    const cidade = cidades.find((c) => c.id === cidadeId);
    return cidade ? cidade.nome : 'Desconhecida';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFuncionarios = [...funcionarios].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para a coluna "Cidade", usamos o nome da cidade
      if (key === 'cidade') {
        aValue = getCidadeNome(a.cidadeId);
        bValue = getCidadeNome(b.cidadeId);
      }

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
    setFuncionarios(sortedFuncionarios);
  };

  const handleView = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setFuncionarioSelecionado(null);
    setIsPopupOpen(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Lista de Funcionários</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link
          to="/funcionarios/cadastrar"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Cadastrar Novo Funcionário
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
              onClick={() => handleSort('cpf')}
            >
              CPF {sortConfig.key === 'cpf' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('cargo')}
            >
              Cargo {sortConfig.key === 'cargo' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleSort('cidade')}
            >
              Cidade {sortConfig.key === 'cidade' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
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
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{funcionario.nome}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{funcionario.cpf}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{funcionario.cargo}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{getCidadeNome(funcionario.cidadeId)}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {funcionario.ativo ? 'Sim' : 'Não'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleView(funcionario)}
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
                  to={`/funcionarios/editar/${funcionario.id}`}
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
                  onClick={() => handleDelete(funcionario.id)}
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
      {isPopupOpen && funcionarioSelecionado && (
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
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Detalhes do Funcionário</h2>
            <p><strong>Nome:</strong> {funcionarioSelecionado.nome}</p>
            <p><strong>CPF:</strong> {funcionarioSelecionado.cpf}</p>
            <p><strong>Cargo:</strong> {funcionarioSelecionado.cargo}</p>
            <p><strong>Salário:</strong> {funcionarioSelecionado.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p><strong>Email:</strong> {funcionarioSelecionado.email}</p>
            <p><strong>Telefone:</strong> {funcionarioSelecionado.telefone}</p>
            <p><strong>Endereço:</strong> {funcionarioSelecionado.endereco}</p>
            <p><strong>Número:</strong> {funcionarioSelecionado.numero}</p>
            <p><strong>Complemento:</strong> {funcionarioSelecionado.complemento}</p>
            <p><strong>Bairro:</strong> {funcionarioSelecionado.bairro}</p>
            <p><strong>CEP:</strong> {funcionarioSelecionado.cep}</p>
            <p><strong>Cidade:</strong> {getCidadeNome(funcionarioSelecionado.cidadeId)}</p>
            <p><strong>Ativo:</strong> {funcionarioSelecionado.ativo ? 'Sim' : 'Não'}</p>
            <p><strong>Data de Admissão:</strong> {new Date(funcionarioSelecionado.dataAdmissao).toLocaleDateString('pt-BR')}</p>
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

export default FuncionarioList;