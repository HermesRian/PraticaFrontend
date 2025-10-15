import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import FornecedorModal from './FornecedorModal';
import FornecedorModalForm from '../Fornecedor/FornecedorModalForm';
import ProdutoModal from './ProdutoModal';

const NotaEntradaFormMUI = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [notaEntrada, setNotaEntrada] = useState({
    numero: '',
    codigo: '',
    modelo: '',
    serie: '',
    fornecedorId: '',
    dataEmissao: '',
    dataChegada: '',
    dataRecebimento: '',
    condicaoPagamentoId: '',
    condicaoPagamento: '', // Descrição da condição de pagamento
    status: 'PENDENTE',
    tipoFrete: 'Nenhum',
    transportadoraId: '',
    valorFrete: 0,
    valorSeguro: 0,
    outrasDespesas: 0,
    valorDesconto: 0,
    observacoes: '',
    itens: [],
    ativo: true
  });

  // Estado para adicionar itens (produtos)
  const [itemAtual, setItemAtual] = useState({
    produtoId: '',
    produtoCodigo: '', // Para exibição do código
    produtoNome: '',
    unidade: '',
    quantidade: 0,
    valorUnitario: 0,
    valorDesconto: 0,
    percentualDesconto: 0,
    valorTotal: 0,
    rateioFrete: 0,
    rateioSeguro: 0,
    rateioOutras: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [erroDataEmissao, setErroDataEmissao] = useState('');
  const [erroDataChegada, setErroDataChegada] = useState('');

  // Estados para controlar os modals
  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);
  const [fornecedorFormModalOpen, setFornecedorFormModalOpen] = useState(false);
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // Buscar dados do fornecedor quando o ID mudar
  useEffect(() => {
    if (notaEntrada.fornecedorId && !fornecedorSelecionado) {
      fetch(`http://localhost:8080/fornecedores/${notaEntrada.fornecedorId}`)
        .then(res => res.json())
        .then(data => {
          setFornecedorSelecionado(data);
        })
        .catch(error => {
          console.error('Erro ao carregar fornecedor:', error);
        });
    }
  }, [notaEntrada.fornecedorId, fornecedorSelecionado]);

  // Carregar nota para edição
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`http://localhost:8080/notas-entrada/${id}`)
        .then(res => res.json())
        .then(data => {
          setNotaEntrada(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar nota:', error);
          setError('Erro ao carregar dados da nota');
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setNotaEntrada(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função específica para tratar mudança do tipo de frete
  const handleTipoFreteChange = (value) => {
    if (value === 'Nenhum') {
      // Zerar valores quando "Nenhum" for selecionado
      setNotaEntrada(prev => ({
        ...prev,
        tipoFrete: value,
        valorFrete: 0,
        valorSeguro: 0,
        outrasDespesas: 0
      }));
    } else {
      // Apenas alterar o tipo de frete para CIF ou FOB
      setNotaEntrada(prev => ({
        ...prev,
        tipoFrete: value
      }));
    }
  };

  // Função para validar todos os dados antes do envio
  const validarDados = () => {
    // Validações de campos obrigatórios
    if (!notaEntrada.numero) {
      return 'Número da nota é obrigatório';
    }
    
    if (!notaEntrada.fornecedorId) {
      return 'Fornecedor é obrigatório';
    }
    
    if (!notaEntrada.dataEmissao) {
      return 'Data de emissão é obrigatória';
    }
    
    // Validar datas
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hoje = `${ano}-${mes}-${dia}`;
    
    const { dataEmissao, dataChegada } = notaEntrada;
    
    // Validar data de emissão não pode ser maior que hoje
    if (dataEmissao && dataEmissao > hoje) {
      return 'Data de emissão não pode ser maior que a data atual';
    }
    
    // Validar data de chegada deve ser >= data de emissão
    if (dataEmissao && dataChegada && dataChegada < dataEmissao) {
      return 'Data de chegada deve ser maior ou igual à data de emissão';
    }
    
    // Validar itens
    if (notaEntrada.itens.length === 0) {
      return 'Pelo menos um item deve ser adicionado à nota';
    }
    
    // Validar fornecedorId como número
    if (isNaN(parseInt(notaEntrada.fornecedorId))) {
      return 'ID do fornecedor inválido';
    }
    
    return null;
  };

  // Função para obter data máxima para emissão (hoje) - corrigindo fuso horário
  const getMaxDataEmissao = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Função para obter data mínima para chegada (data de emissão)
  const getMinDataChegada = () => {
    return notaEntrada.dataEmissao || undefined;
  };

  // Funções para manipular os modals
  const handleFornecedorSelect = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    handleChange('fornecedorId', fornecedor.id);
    
    // Preencher condição de pagamento do fornecedor
    preencherCondicaoPagamento(fornecedor);
  };

  const handleProdutoSelect = (produto) => {
    setItemAtual(prev => ({
      ...prev,
      produtoId: produto.id, // ID numérico para a API
      produtoCodigo: produto.codigo || produto.id.toString(), // Código para exibição
      produtoNome: produto.nome,
      unidade: produto.unidade || 'UN',
      valorUnitario: produto.valorCompra || 0 // Usar valorCompra fixo do produto
    }));
    calcularTotalItem();
  };



  // Função para calcular total do item atual
  // Função para calcular total do item (apenas para display na tela)
  const calcularTotalItem = () => {
    const { quantidade, valorUnitario, valorDesconto } = itemAtual;
    const subtotal = quantidade * valorUnitario;
    const total = subtotal - valorDesconto;
    
    setItemAtual(prev => ({ 
      ...prev, 
      valorTotal: total 
    }));
  };

  // Função para adicionar item à lista
  const adicionarItem = () => {
    // Validações
    if (!itemAtual.produtoId) {
      setError('Selecione um produto antes de adicionar o item');
      return;
    }
    if (itemAtual.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }
    if (itemAtual.valorUnitario <= 0) {
      setError('Valor unitário inválido. Verifique se o produto possui valor de compra cadastrado');
      return;
    }

    // Limpar erro
    setError('');
    
    // Verificar se o produto já existe na lista
    setNotaEntrada(prev => {
      const produtoExistente = prev.itens.find(item => item.produtoId === itemAtual.produtoId);
      
      if (produtoExistente) {
        // Produto já existe: somar quantidade e atualizar desconto
        console.log(`Produto ${itemAtual.produtoNome} já existe. Atualizando quantidade e desconto.`);
        
        // Mostrar mensagem temporária de atualização
        setSuccessMessage(`Produto "${itemAtual.produtoNome}" atualizado: quantidade somada e desconto sobrescrito`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        const itensAtualizados = prev.itens.map(item => {
          if (item.produtoId === itemAtual.produtoId) {
            const quantidadeAnterior = item.quantidade;
            const descontoAnterior = item.valorDesconto;
            const novaQuantidade = quantidadeAnterior + itemAtual.quantidade;
            const novoDesconto = itemAtual.valorDesconto; // Sobrescrever desconto
            const novoTotal = (novaQuantidade * item.valorUnitario) - novoDesconto;
            
            console.log(`- Quantidade: ${quantidadeAnterior} + ${itemAtual.quantidade} = ${novaQuantidade}`);
            console.log(`- Desconto: ${descontoAnterior} → ${novoDesconto} (sobrescrito)`);
            console.log(`- Total: ${novoTotal}`);
            
            return {
              ...item,
              quantidade: novaQuantidade,
              valorDesconto: novoDesconto,
              valorTotal: novoTotal
            };
          }
          return item;
        });
        
        return {
          ...prev,
          itens: itensAtualizados
        };
      } else {
        // Produto novo: adicionar à lista
        console.log(`Adicionando novo produto: ${itemAtual.produtoNome}`);
        return {
          ...prev,
          itens: [...prev.itens, { ...itemAtual, id: Date.now() }]
        };
      }
    });
    
    // Limpar formulário de item
    setItemAtual({
      produtoId: '',
      produtoCodigo: '',
      produtoNome: '',
      unidade: '',
      quantidade: 0,
      valorUnitario: 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 0,
      rateioFrete: 0,
      rateioSeguro: 0,
      rateioOutras: 0
    });
  };

  // Função para remover item da lista
  const removerItem = (id) => {
    setNotaEntrada(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== id)
    }));
  };

  // Função para buscar condição de pagamento do fornecedor
  const preencherCondicaoPagamento = async (fornecedor) => {
    console.log('Preenchendo condição de pagamento para fornecedor:', fornecedor);
    console.log('Campos disponíveis:', Object.keys(fornecedor));
    
    // Se o fornecedor já tem as informações de condição de pagamento
    if (fornecedor.condicaoPagamentoId || fornecedor.codigoCondicaoPagamento) {
      const condicaoId = fornecedor.condicaoPagamentoId || fornecedor.codigoCondicaoPagamento;
      
      // Buscar a descrição da condição de pagamento
      try {
        const response = await fetch(`http://localhost:8080/condicoes-pagamento/${condicaoId}`);
        if (response.ok) {
          const condicao = await response.json();
          setNotaEntrada(prev => ({
            ...prev,
            condicaoPagamentoId: condicaoId,
            condicaoPagamento: condicao.descricao || condicao.nome || `Condição ${condicaoId}`
          }));
        } else {
          // Se não conseguir buscar a descrição, usar apenas o ID
          setNotaEntrada(prev => ({
            ...prev,
            condicaoPagamentoId: condicaoId,
            condicaoPagamento: `Condição ${condicaoId}`
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar descrição da condição:', error);
        setNotaEntrada(prev => ({
          ...prev,
          condicaoPagamentoId: condicaoId,
          condicaoPagamento: `Condição ${condicaoId}`
        }));
      }
      return;
    }

    // Se não tem, buscar informações completas do fornecedor
    try {
      const response = await fetch(`http://localhost:8080/fornecedores/${fornecedor.id}`);
      if (response.ok) {
        const fornecedorCompleto = await response.json();
        console.log('Dados completos do fornecedor:', fornecedorCompleto);
        
        // Tentar diferentes campos que podem conter a condição de pagamento
        let codigo = '';
        
        // Verificar possíveis campos de código
        if (fornecedorCompleto.condicaoPagamentoId) {
          codigo = fornecedorCompleto.condicaoPagamentoId;
        } else if (fornecedorCompleto.codigoCondicaoPagamento) {
          codigo = fornecedorCompleto.codigoCondicaoPagamento;
        }
        
        if (codigo) {
          // Buscar a descrição da condição de pagamento
          try {
            const condResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${codigo}`);
            if (condResponse.ok) {
              const condicao = await condResponse.json();
              setNotaEntrada(prev => ({
                ...prev,
                condicaoPagamentoId: codigo,
                condicaoPagamento: condicao.descricao || condicao.nome || `Condição ${codigo}`
              }));
            } else {
              setNotaEntrada(prev => ({
                ...prev,
                condicaoPagamentoId: codigo,
                condicaoPagamento: `Condição ${codigo}`
              }));
            }
          } catch (err) {
            console.log('Erro ao buscar descrição da condição:', err);
            setNotaEntrada(prev => ({
              ...prev,
              condicaoPagamentoId: codigo,
              condicaoPagamento: `Condição ${codigo}`
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar condição de pagamento:', error);
    }
  };

  // Atualizar cálculo quando item atual muda
  useEffect(() => {
    calcularTotalItem();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemAtual.quantidade, itemAtual.valorUnitario, itemAtual.valorDesconto]);

  useEffect(() => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hoje = `${ano}-${mes}-${dia}`;
    
    const { dataEmissao, dataChegada } = notaEntrada;
    
    setErroDataEmissao('');
    setErroDataChegada('');
    
    if (dataEmissao && dataEmissao > hoje) {
      setErroDataEmissao('Data não pode ser maior que hoje');
    }
    
    if (dataEmissao && dataChegada && dataChegada < dataEmissao) {
      setErroDataChegada('Data deve ser maior ou igual à data de emissão');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notaEntrada.dataEmissao, notaEntrada.dataChegada]);

  // Função para transformar dados do formulário para o formato da API
  // Backend agora calcula todos os valores automaticamente
  const transformarDadosParaAPI = () => {
    // Transformar itens enviando apenas dados brutos (sem cálculos)
    const itens = notaEntrada.itens.map(item => {
      const produtoId = parseInt(item.produtoId);
      if (!produtoId || isNaN(produtoId)) {
        throw new Error(`ID do produto inválido: ${item.produtoId}`);
      }
      
      return {
        produtoId: produtoId,
        quantidade: parseFloat(item.quantidade || 0),
        valorUnitario: parseFloat(item.valorUnitario || 0),
        valorDesconto: parseFloat(item.valorDesconto || 0)
      };
    });
    
    console.log('Enviando dados brutos para o backend:', {
      itens: itens,
      valorFrete: notaEntrada.valorFrete,
      valorSeguro: notaEntrada.valorSeguro,
      outrasDespesas: notaEntrada.outrasDespesas
    });
    
    return {
      numero: notaEntrada.numero,
      modelo: notaEntrada.modelo || "55",
      serie: notaEntrada.serie || "1",
      fornecedorId: parseInt(notaEntrada.fornecedorSelecionado?.id || notaEntrada.fornecedorId),
      dataEmissao: notaEntrada.dataEmissao,
      dataRecebimento: notaEntrada.dataChegada,
      condicaoPagamentoId: parseInt(notaEntrada.condicaoPagamentoId || 23),
      status: notaEntrada.status || "PENDENTE",
      tipoFrete: notaEntrada.tipoFrete,
      transportadoraId: parseInt(notaEntrada.transportadoraId || 1),
      valorFrete: parseFloat(notaEntrada.valorFrete || 0),
      valorSeguro: parseFloat(notaEntrada.valorSeguro || 0),
      outrasDespesas: parseFloat(notaEntrada.outrasDespesas || 0),
      observacoes: notaEntrada.observacoes || '',
      ativo: notaEntrada.ativo !== false,
      itens: itens
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações antes de enviar
    const erroValidacao = validarDados();
    if (erroValidacao) {
      setError(erroValidacao);
      setLoading(false);
      return;
    }

    try {
      const url = isEdit 
        ? `http://localhost:8080/notas-entrada/${id}`
        : 'http://localhost:8080/notas-entrada';
      
      const method = isEdit ? 'PUT' : 'POST';

      // Transformar dados para o formato da API
      const dadosAPI = transformarDadosParaAPI();
      console.log('Dados sendo enviados para API:', dadosAPI);
      console.log('JSON stringified:', JSON.stringify(dadosAPI, null, 2));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAPI),
      });

      if (response.ok) {
        navigate('/notas-entrada');
      } else {
        // Tentar obter detalhes do erro
        const errorData = await response.text();
        console.error('Erro da API:', response.status, errorData);
        setError(`Erro ${response.status}: ${errorData || 'Erro ao salvar nota de entrada'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/notas-entrada');
  };

  if (loading && isEdit) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      padding: { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa', 
      minHeight: '100vh',
      paddingBottom: 0.5
    }}>
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        elevation={10}
        sx={{
          width: '95%',
          maxWidth: 1400,
          mx: 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho com título e switch Ativo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box sx={{ width: 120 }}></Box>
          <Typography 
            variant="h5" 
            component="h1" 
            align="center" 
            sx={{ color: '#333', fontWeight: 600, flex: 1 }}
          >
            {isEdit ? 'Editar Nota de Entrada' : 'Cadastrar Nova Nota de Entrada'}
          </Typography>
          <Box sx={{ width: 120 }}></Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {/* Linha 1: Número, Modelo, Série, Fornecedor, Data Emissão, Data Chegada */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Número"
              value={notaEntrada.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="123456"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Modelo"
              value={notaEntrada.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              placeholder="55"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Série"
              value={notaEntrada.serie}
              onChange={(e) => handleChange('serie', e.target.value)}
              placeholder="1"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Fornecedor"
              value={fornecedorSelecionado ? (fornecedorSelecionado.nomeFantasia || fornecedorSelecionado.razaoSocial) : (notaEntrada.fornecedorId ? 'Carregando...' : '')}
              placeholder="Clique para selecionar fornecedor"
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <SearchIcon 
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'action.active',
                      '&:hover': { color: 'primary.main' }
                    }} 
                  />
                )
              }}
              onClick={() => setFornecedorModalOpen(true)}
              sx={{ 
                cursor: 'pointer',
                '& .MuiInputBase-input': { cursor: 'pointer' }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Data Emissão"
              type="date"
              value={notaEntrada.dataEmissao}
              onChange={(e) => handleChange('dataEmissao', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                max: getMaxDataEmissao()
              }}
              error={!!erroDataEmissao}
              helperText={erroDataEmissao}
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <TextField
              fullWidth
              size="small"
              label="Data Chegada"
              type="date"
              value={notaEntrada.dataChegada}
              onChange={(e) => handleChange('dataChegada', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: getMinDataChegada()
              }}
              error={!!erroDataChegada}
              helperText={erroDataChegada}
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* linha 2 add itens */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Grid item sx={{ width: '18%' }}>
            <TextField
              fullWidth
              size="small"
              label="Cód Produto"
              value={itemAtual.produtoCodigo}
              placeholder="Clique para buscar"
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <SearchIcon 
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'action.active',
                      '&:hover': { color: 'primary.main' }
                    }} 
                  />
                )
              }}
              onClick={() => setProdutoModalOpen(true)}
              sx={{ 
                cursor: 'pointer',
                '& .MuiInputBase-input': { cursor: 'pointer' }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              size="small"
              label="Produto"
              value={itemAtual.produtoNome}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '8%' }}>
            <TextField
              fullWidth
              size="small"
              label="Unidade"
              value={itemAtual.unidade}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Quantidade"
              type="number"
              value={itemAtual.quantidade}
              onChange={(e) => setItemAtual(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
              InputProps={{ 
                inputProps: { step: 1, min: 0 } // Quantidade sem decimal
              }}
              variant="outlined"
              sx={{ 
                '& .MuiInputBase-input': { 
                  textAlign: 'right' // Alinhamento à direita
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Valor Unit."
              type="number"
              value={itemAtual.valorUnitario}
              InputProps={{ 
                readOnly: true,
                inputProps: { step: 0.01, min: 0 },
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              sx={{ 
                '& .MuiInputBase-input': { 
                  textAlign: 'right',
                  backgroundColor: '#f5f5f5' // Indicar visualmente que é somente leitura
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Desconto"
              type="number"
              value={itemAtual.valorDesconto}
              onChange={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                setItemAtual(prev => ({ 
                  ...prev, 
                  valorDesconto: valor,
                  percentualDesconto: 0
                }));
              }}
              InputProps={{ 
                inputProps: { step: 0.01, min: 0 },
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              sx={{ 
                '& .MuiInputBase-input': { 
                  textAlign: 'right' 
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Total Item"
              type="number"
              value={itemAtual.valorTotal}
              InputProps={{ 
                readOnly: true,
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              sx={{ 
                bgcolor: '#f5f5f5',
                '& .MuiInputBase-input': { 
                  textAlign: 'right' 
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '5%' }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={adicionarItem}
              disabled={!itemAtual.produtoId || itemAtual.quantidade <= 0}
              sx={{ minHeight: 40 }}
            >
              <AddIcon />
            </Button>
          </Grid>
        </Grid>

        {/* Tabela de Itens */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Produto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unid</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Qtd</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor Un.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Desconto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notaEntrada.itens.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.produtoCodigo || item.produtoId}</TableCell>
                  <TableCell>{item.produtoNome}</TableCell>
                  <TableCell>{item.unidade}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                  <TableCell>R$ {item.valorDesconto.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>R$ {item.valorTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => removerItem(item.id)}
                      sx={{ color: '#dc3545' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {notaEntrada.itens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Nenhum item adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Total dos Produtos */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            Total Produtos: 
            <Typography component="span" variant="subtitle1" fontWeight={600} color="text.primary" sx={{ ml: 1 }}>
              R$ {notaEntrada.itens.reduce((sum, item) => sum + item.valorTotal, 0).toFixed(2)}
            </Typography>
          </Typography>
        </Box>

        {/* Seção Frete e Outras Despesas */}
        <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Frete e Outras Despesas
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '30%' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                Tipo Frete
              </FormLabel>
              <RadioGroup
                row
                value={notaEntrada.tipoFrete}
                onChange={(e) => handleTipoFreteChange(e.target.value)}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="CIF" 
                  control={<Radio size="small" />} 
                  label="CIF"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                    mr: 1
                  }}
                />
                <FormControlLabel 
                  value="FOB" 
                  control={<Radio size="small" />} 
                  label="FOB"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                    mr: 1
                  }}
                />
                <FormControlLabel 
                  value="Nenhum" 
                  control={<Radio size="small" />} 
                  label="Nenhum"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                    mr: 0
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Campos numéricos só aparecem quando CIF ou FOB for selecionado */}
          {(notaEntrada.tipoFrete === 'CIF' || notaEntrada.tipoFrete === 'FOB') && (
            <>
              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Frete"
                  type="number"
                  value={notaEntrada.valorFrete}
                  onChange={(e) => handleChange('valorFrete', parseFloat(e.target.value) || 0)}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      textAlign: 'right' 
                    }
                  }}
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Seguro"
                  type="number"
                  value={notaEntrada.valorSeguro}
                  onChange={(e) => handleChange('valorSeguro', parseFloat(e.target.value) || 0)}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      textAlign: 'right' 
                    }
                  }}
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Outras Despesas"
                  type="number"
                  value={notaEntrada.outrasDespesas}
                  onChange={(e) => handleChange('outrasDespesas', parseFloat(e.target.value) || 0)}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      textAlign: 'right' 
                    }
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Total da Nota */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            Total da Nota: 
            <Typography component="span" variant="h6" fontWeight={700} color="text.primary" sx={{ ml: 1 }}>
              R$ {(
                notaEntrada.itens.reduce((sum, item) => sum + item.valorTotal, 0) +
                parseFloat(notaEntrada.valorFrete || 0) +
                parseFloat(notaEntrada.valorSeguro || 0) +
                parseFloat(notaEntrada.outrasDespesas || 0)
              ).toFixed(2)}
            </Typography>
          </Typography>
        </Box>

        {/* Seção Condição de Pagamento */}
        <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Condição de Pagamento
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Cód Cond. Pgto"
              value={notaEntrada.condicaoPagamentoId}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              size="small"
              label="Condição de Pagamento"
              value={notaEntrada.condicaoPagamento}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>
        </Grid>

        {/* Campo Observação */}
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              size="small"
              label="Observações"
              value={notaEntrada.observacao}
              onChange={(e) => handleChange('observacao', e.target.value)}
              placeholder="Observações gerais sobre a nota de entrada..."
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Botões de Ação */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          gap: 2,
          mt: 4,
          pt: 3,
          borderTop: '1px solid #eee'
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
            sx={{ 
              minWidth: 120,
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              minWidth: 120,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Salvar')}
          </Button>
        </Box>
      </Paper>

      {/* Modals */}
      <FornecedorModal
        open={fornecedorModalOpen}
        onClose={() => setFornecedorModalOpen(false)}
        onSelect={handleFornecedorSelect}
        onAddNew={() => setFornecedorFormModalOpen(true)}
      />

      <ProdutoModal
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        onSelect={handleProdutoSelect}
      />

      <FornecedorModalForm
        open={fornecedorFormModalOpen}
        onClose={() => setFornecedorFormModalOpen(false)}
        onSuccess={(novoFornecedor) => {
          // Fechar modal de cadastro e selecionar o novo fornecedor
          setFornecedorFormModalOpen(false);
          setFornecedorModalOpen(false);
          handleFornecedorSelect(novoFornecedor);
        }}
      />
    </Box>
  );
};

export default NotaEntradaFormMUI;