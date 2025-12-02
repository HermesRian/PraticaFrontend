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
import ClienteModal from '../Cliente/ClienteModal';
import ClienteModalForm from '../Cliente/ClienteModalForm';
import ProdutoModal from '../Produto/ProdutoModal';
import ProdutoModalForm from '../Produto/ProdutoModalForm';

const NotaSaidaFormMUI = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [notaSaida, setNotaSaida] = useState({
    numero: '',
    codigo: '',
    modelo: '',
    serie: '',
    clienteId: '',
    dataEmissao: '',
    dataChegada: '',
    dataRecebimento: '',
    condicaoPagamentoId: '',
    condicaoPagamento: '',
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

  const [itemAtual, setItemAtual] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [erroDataEmissao, setErroDataEmissao] = useState('');
  const [erroDataChegada, setErroDataChegada] = useState('');
  const [erroDesconto, setErroDesconto] = useState('');

  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteFormModalOpen, setClienteFormModalOpen] = useState(false);
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [produtoFormModalOpen, setProdutoFormModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [parcelasCondicao, setParcelasCondicao] = useState([]);
  
  const [clienteRefreshTrigger, setClienteRefreshTrigger] = useState(0);
  const [produtoRefreshTrigger, setProdutoRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8080/unidades-medida')
      .then(res => res.json())
      .then(data => {
        setUnidadesMedida(data);
      })
      .catch(error => console.error('Erro ao carregar unidades de medida:', error));
  }, []);

  useEffect(() => {
    if (notaSaida.clienteId && !clienteSelecionado) {
      fetch(`http://localhost:8080/clientes/${notaSaida.clienteId}`)
        .then(res => res.json())
        .then(data => {
          setClienteSelecionado(data);
        })
        .catch(error => {
          console.error('Erro ao carregar cliente:', error);
        });
    }
  }, [notaSaida.clienteId, clienteSelecionado]);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`http://localhost:8080/notas-saida/${id}`)
        .then(res => res.json())
        .then(data => {
          setNotaSaida(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar nota:', error);
          setError('Erro ao carregar dados da nota');
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const isPrimeiraLinhaCompleta = () => {
    return !!(
      notaSaida.modelo &&
      notaSaida.serie &&
      notaSaida.numero &&
      notaSaida.clienteId &&
      notaSaida.dataEmissao &&
      notaSaida.dataChegada
    );
  };

  const temProdutosAdicionados = () => {
    return notaSaida.itens.length > 0;
  };

  const handleChange = (field, value) => {
    setNotaSaida(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTipoFreteChange = (value) => {
    if (value === 'Nenhum') {
      setNotaSaida(prev => ({
        ...prev,
        tipoFrete: value,
        valorFrete: 0,
        valorSeguro: 0,
        outrasDespesas: 0
      }));
    } else {
      setNotaSaida(prev => ({
        ...prev,
        tipoFrete: value
      }));
    }
  };

  const validarDados = () => {
    if (!notaSaida.numero) {
      return 'Número da nota é obrigatório';
    }
    
    if (!notaSaida.clienteId) {
      return 'Cliente é obrigatório';
    }
    
    if (!notaSaida.dataEmissao) {
      return 'Data de emissão é obrigatória';
    }
    
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hoje = `${ano}-${mes}-${dia}`;
    
    const { dataEmissao, dataChegada } = notaSaida;
    
    if (dataEmissao && dataEmissao > hoje) {
      return 'Data de emissão não pode ser maior que a data atual';
    }
    
    if (dataEmissao && dataChegada && dataChegada < dataEmissao) {
      return 'Data de chegada deve ser maior ou igual à data de emissão';
    }
    
    if (notaSaida.itens.length === 0) {
      return 'Pelo menos um item deve ser adicionado à nota';
    }
    
    if (isNaN(parseInt(notaSaida.clienteId))) {
      return 'ID do cliente inválido';
    }
    
    return null;
  };

  const getMaxDataEmissao = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const getMinDataChegada = () => {
    return notaSaida.dataEmissao || undefined;
  };

  const handleClienteSelect = (cliente) => {
    setClienteSelecionado(cliente);
    handleChange('clienteId', cliente.id);
    preencherCondicaoPagamento(cliente);
  };

  const getUnidadeMedidaNome = (unidadeMedidaId) => {
    if (!unidadeMedidaId || !unidadesMedida.length) return 'UN';
    const unidade = unidadesMedida.find(u => u.id === unidadeMedidaId);
    return unidade ? unidade.nome : 'UN';
  };

  const calcularTotalNota = () => {
    const totalProdutos = notaSaida.itens.reduce((sum, item) => sum + item.valorTotal, 0);
    const totalNota = totalProdutos +
      parseFloat(notaSaida.valorFrete || 0) +
      parseFloat(notaSaida.valorSeguro || 0) +
      parseFloat(notaSaida.outrasDespesas || 0);
    return parseFloat(totalNota.toFixed(2));
  };

  const calcularValorParcela = (parcela) => {
    const totalNota = calcularTotalNota();
    const percentual = parseFloat(parcela.percentual || 0);
    return (totalNota * percentual) / 100;
  };

  const calcularDataVencimento = (parcela) => {
    if (!notaSaida.dataEmissao || !parcela.dias) {
      return 'A definir';
    }
    
    const dataEmissao = new Date(notaSaida.dataEmissao + 'T00:00:00');
    const dataVencimento = new Date(dataEmissao);
    dataVencimento.setDate(dataVencimento.getDate() + parseInt(parcela.dias));
    
    return dataVencimento.toLocaleDateString('pt-BR');
  };

  const handleProdutoSelect = (produto) => {
    const unidadeNome = getUnidadeMedidaNome(produto.unidadeMedidaId);
    
    // Limpar erro de desconto ao selecionar novo produto
    setErroDesconto('');
    
    console.log('Produto selecionado:', produto);
    console.log('valorVenda:', produto.valorVenda);
    
    setItemAtual(prev => ({
      ...prev,
      produtoId: produto.id, // ID numérico para a API
      produtoCodigo: produto.codigo || (produto.id ? produto.id.toString() : ''), // Código para exibição
      produtoNome: produto.nome,
      unidade: unidadeNome,
      // Sugerir valorVenda do produto, mas permitir que seja editado
      valorUnitario: produto.valorVenda || prev.valorUnitario || 0
    }));
    calcularTotalItem();
  };

  const calcularTotalItem = () => {
    const { quantidade, valorUnitario, valorDesconto } = itemAtual;
    const subtotal = quantidade * valorUnitario;
    const total = subtotal - valorDesconto;
    const totalArredondado = parseFloat(total.toFixed(2));
    
    setItemAtual(prev => ({ 
      ...prev, 
      valorTotal: totalArredondado 
    }));
  };

  const adicionarItem = () => {
    if (!itemAtual.produtoId) {
      setError('Selecione um produto antes de adicionar o item');
      return;
    }
    if (itemAtual.quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }
    if (itemAtual.valorUnitario <= 0) {
      setError('Valor unitário deve ser maior que zero');
      return;
    }

    setError('');
    setErroDesconto('');
    
    setNotaSaida(prev => {
      const produtoExistente = prev.itens.find(item => item.produtoId === itemAtual.produtoId);
      
      if (produtoExistente) {
        const itensAtualizados = prev.itens.map(item => {
          if (item.produtoId === itemAtual.produtoId) {
            const novaQuantidade = item.quantidade + itemAtual.quantidade;
            const novoDesconto = itemAtual.valorDesconto;
            const novoTotal = parseFloat(((novaQuantidade * item.valorUnitario) - novoDesconto).toFixed(2));
            
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
        return {
          ...prev,
          itens: [...prev.itens, { ...itemAtual, id: Date.now() }]
        };
      }
    });
    
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

  const removerItem = (id) => {
    setNotaSaida(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== id)
    }));
  };

  const preencherCondicaoPagamento = async (cliente) => {
    if (cliente.condicaoPagamentoId || cliente.codigoCondicaoPagamento) {
      const condicaoId = cliente.condicaoPagamentoId || cliente.codigoCondicaoPagamento;
      
      try {
        const response = await fetch(`http://localhost:8080/condicoes-pagamento/${condicaoId}`);
        if (response.ok) {
          const condicao = await response.json();
          setNotaSaida(prev => ({
            ...prev,
            condicaoPagamentoId: condicaoId,
            condicaoPagamento: condicao.descricao || condicao.nome || `Condição ${condicaoId}`
          }));
          
          if (condicao.parcelasCondicao && condicao.parcelasCondicao.length > 0) {
            setParcelasCondicao(condicao.parcelasCondicao);
          } else {
            setParcelasCondicao([]);
          }
        } else {
          setNotaSaida(prev => ({
            ...prev,
            condicaoPagamentoId: condicaoId,
            condicaoPagamento: `Condição ${condicaoId}`
          }));
          setParcelasCondicao([]);
        }
      } catch (error) {
        console.error('Erro ao buscar descrição da condição:', error);
        setNotaSaida(prev => ({
          ...prev,
          condicaoPagamentoId: condicaoId,
          condicaoPagamento: `Condição ${condicaoId}`
        }));
        setParcelasCondicao([]);
      }
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/clientes/${cliente.id}`);
      if (response.ok) {
        const clienteCompleto = await response.json();
        
        let codigo = '';
        if (clienteCompleto.condicaoPagamentoId) {
          codigo = clienteCompleto.condicaoPagamentoId;
        } else if (clienteCompleto.codigoCondicaoPagamento) {
          codigo = clienteCompleto.codigoCondicaoPagamento;
        }
        
        if (codigo) {
          try {
            const condResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${codigo}`);
            if (condResponse.ok) {
              const condicao = await condResponse.json();
              setNotaSaida(prev => ({
                ...prev,
                condicaoPagamentoId: codigo,
                condicaoPagamento: condicao.descricao || condicao.nome || `Condição ${codigo}`
              }));
              
              if (condicao.parcelasCondicao && condicao.parcelasCondicao.length > 0) {
                setParcelasCondicao(condicao.parcelasCondicao);
              } else {
                setParcelasCondicao([]);
              }
            } else {
              setNotaSaida(prev => ({
                ...prev,
                condicaoPagamentoId: codigo,
                condicaoPagamento: `Condição ${codigo}`
              }));
              setParcelasCondicao([]);
            }
          } catch {
            setNotaSaida(prev => ({
              ...prev,
              condicaoPagamentoId: codigo,
              condicaoPagamento: `Condição ${codigo}`
            }));
            setParcelasCondicao([]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar condição de pagamento:', error);
    }
  };

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
    
    const { dataEmissao, dataChegada } = notaSaida;
    
    setErroDataEmissao('');
    setErroDataChegada('');
    
    if (dataEmissao && dataEmissao > hoje) {
      setErroDataEmissao('Data não pode ser maior que hoje');
    }
    
    if (dataEmissao && dataChegada && dataChegada < dataEmissao) {
      setErroDataChegada('Data deve ser maior ou igual à data de emissão');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notaSaida.dataEmissao, notaSaida.dataChegada]);

  const formatarDataParaAPI = (data) => {
    if (!data) return null;
    if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `${data}T12:00:00`;
    }
    return data;
  };

  const transformarDadosParaAPI = () => {
    const itens = notaSaida.itens.map(item => {
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
    
    return {
      numero: notaSaida.numero,
      modelo: notaSaida.modelo || "55",
      serie: notaSaida.serie || "1",
      clienteId: parseInt(notaSaida.clienteSelecionado?.id || notaSaida.clienteId),
      dataEmissao: formatarDataParaAPI(notaSaida.dataEmissao),
      dataChegada: formatarDataParaAPI(notaSaida.dataChegada),
      dataRecebimento: formatarDataParaAPI(notaSaida.dataRecebimento),
      condicaoPagamentoId: parseInt(notaSaida.condicaoPagamentoId || 23),
      status: notaSaida.status || "PENDENTE",
      tipoFrete: notaSaida.tipoFrete,
      transportadoraId: parseInt(notaSaida.transportadoraId || 1),
      valorFrete: parseFloat(notaSaida.valorFrete || 0),
      valorSeguro: parseFloat(notaSaida.valorSeguro || 0),
      outrasDespesas: parseFloat(notaSaida.outrasDespesas || 0),
      observacoes: notaSaida.observacoes || '',
      ativo: notaSaida.ativo !== false,
      itens: itens
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const erroValidacao = validarDados();
    if (erroValidacao) {
      setError(erroValidacao);
      setLoading(false);
      return;
    }

    try {
      const url = isEdit 
        ? `http://localhost:8080/notas-saida/${id}`
        : 'http://localhost:8080/notas-saida';
      
      const method = isEdit ? 'PUT' : 'POST';

      const dadosAPI = transformarDadosParaAPI();

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAPI),
      });

      if (response.ok) {
        navigate('/notas-saida');
      } else {
        const errorText = await response.text();
        
        // Verificar se é erro de estoque insuficiente
        if (errorText.includes('Estoque insuficiente')) {
          setError(`⚠️ ESTOQUE INSUFICIENTE: ${errorText}`);
        } else {
          setError(`Erro ${response.status}: ${errorText || 'Erro ao salvar nota de saída'}`);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/notas-saida');
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
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
            {isEdit ? 'Editar Nota de Saída' : 'Cadastrar Nova Nota de Saída'}
          </Typography>
          <Box sx={{ width: 120 }}></Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Modelo"
              value={notaSaida.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              placeholder="55"
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'right'
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Série"
              value={notaSaida.serie}
              onChange={(e) => handleChange('serie', e.target.value)}
              placeholder="1"
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'right'
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Número"
              value={notaSaida.numero}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, '');
                if (valor.length <= 9) {
                  handleChange('numero', valor);
                }
              }}
              placeholder="123456"
              variant="outlined"
              inputProps={{ maxLength: 9 }}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'right'
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Cliente"
              value={clienteSelecionado ? (clienteSelecionado.nomeFantasia || clienteSelecionado.razaoSocial || clienteSelecionado.nome) : (notaSaida.clienteId ? 'Carregando...' : '')}
              placeholder="Clique para selecionar cliente"
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
              onClick={() => setClienteModalOpen(true)}
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
              value={notaSaida.dataEmissao}
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
              value={notaSaida.dataChegada}
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

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Grid item sx={{ width: '18%' }}>
            <TextField
              fullWidth
              size="small"
              label="Cód Produto"
              value={itemAtual.produtoCodigo}
              placeholder={isPrimeiraLinhaCompleta() ? "Clique para buscar" : "Preencha os dados acima primeiro"}
              variant="outlined"
              disabled={!isPrimeiraLinhaCompleta()}
              InputProps={{
                readOnly: true,
                endAdornment: isPrimeiraLinhaCompleta() && (
                  <SearchIcon 
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'action.active',
                      '&:hover': { color: 'primary.main' }
                    }} 
                  />
                )
              }}
              onClick={() => isPrimeiraLinhaCompleta() && setProdutoModalOpen(true)}
              sx={{ 
                cursor: isPrimeiraLinhaCompleta() ? 'pointer' : 'not-allowed',
                '& .MuiInputBase-input': { 
                  cursor: isPrimeiraLinhaCompleta() ? 'pointer' : 'not-allowed',
                  textAlign: 'right'
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              size="small"
              label="Produto"
              value={itemAtual.produtoNome}
              placeholder={!isPrimeiraLinhaCompleta() ? "Preencha os dados acima primeiro" : ""}
              disabled={!isPrimeiraLinhaCompleta()}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: isPrimeiraLinhaCompleta() ? '#f5f5f5' : '#e0e0e0' }}
            />
          </Grid>

          <Grid item sx={{ width: '8%' }}>
            <TextField
              fullWidth
              size="small"
              label="Unidade"
              value={itemAtual.unidade}
              disabled={!isPrimeiraLinhaCompleta()}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: isPrimeiraLinhaCompleta() ? '#f5f5f5' : '#e0e0e0' }}
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Quantidade"
              type="number"
              value={itemAtual.quantidade}
              disabled={!isPrimeiraLinhaCompleta()}
              onChange={(e) => isPrimeiraLinhaCompleta() && setItemAtual(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
              InputProps={{ 
                inputProps: { step: 1, min: 0 }
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
              label="Valor Unit."
              type="number"
              value={itemAtual.valorUnitario}
              disabled={!isPrimeiraLinhaCompleta()}
              onChange={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                const valorFormatado = Math.round(valor * 100) / 100;
                setItemAtual({
                  ...itemAtual,
                  valorUnitario: valorFormatado
                });
              }}
              onBlur={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                setItemAtual(prev => ({
                  ...prev,
                  valorUnitario: parseFloat(valor.toFixed(2))
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
              label="Desconto"
              type="number"
              value={itemAtual.valorDesconto}
              disabled={!isPrimeiraLinhaCompleta()}
              onChange={(e) => {
                if (isPrimeiraLinhaCompleta()) {
                  const valor = parseFloat(e.target.value) || 0;
                  const valorFormatado = Math.round(valor * 100) / 100;
                  const valorUnitario = itemAtual.valorUnitario || 0;
                  
                  if (valorFormatado > valorUnitario) {
                    setItemAtual(prev => ({ 
                      ...prev, 
                      valorDesconto: valorUnitario,
                      percentualDesconto: 0
                    }));
                  } else {
                    setErroDesconto('');
                    setItemAtual(prev => ({ 
                      ...prev, 
                      valorDesconto: valorFormatado,
                      percentualDesconto: 0
                    }));
                  }
                }
              }}
              onBlur={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                setItemAtual(prev => ({
                  ...prev,
                  valorDesconto: parseFloat(valor.toFixed(2))
                }));
              }}
              InputProps={{ 
                inputProps: { step: 0.01, min: 0, max: itemAtual.valorUnitario || 999999 },
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              error={!!erroDesconto}
              helperText={erroDesconto}
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
              value={itemAtual.quantidade > 0 ? itemAtual.valorTotal : ''}
              disabled={!isPrimeiraLinhaCompleta()}
              InputProps={{ 
                readOnly: true,
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              sx={{ 
                bgcolor: isPrimeiraLinhaCompleta() ? '#f5f5f5' : '#e0e0e0',
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
              disabled={!isPrimeiraLinhaCompleta() || !itemAtual.produtoId || itemAtual.quantidade <= 0}
              sx={{ minHeight: 40 }}
            >
              <AddIcon />
            </Button>
          </Grid>
        </Grid>

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
              {notaSaida.itens.map((item) => (
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
              {notaSaida.itens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Nenhum item adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            Total Produtos: 
            <Typography component="span" variant="subtitle1" fontWeight={600} color="text.primary" sx={{ ml: 1 }}>
              R$ {notaSaida.itens.reduce((sum, item) => sum + item.valorTotal, 0).toFixed(2)}
            </Typography>
          </Typography>
        </Box>

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
                value={notaSaida.tipoFrete}
                onChange={(e) => temProdutosAdicionados() && handleTipoFreteChange(e.target.value)}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="CIF" 
                  control={<Radio size="small" disabled={!temProdutosAdicionados()} />} 
                  label="CIF"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.875rem',
                      color: temProdutosAdicionados() ? 'inherit' : '#999'
                    },
                    mr: 1
                  }}
                />
                <FormControlLabel 
                  value="FOB" 
                  control={<Radio size="small" disabled={!temProdutosAdicionados()} />} 
                  label="FOB"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.875rem',
                      color: temProdutosAdicionados() ? 'inherit' : '#999'
                    },
                    mr: 1
                  }}
                />
                <FormControlLabel 
                  value="Nenhum" 
                  control={<Radio size="small" disabled={!temProdutosAdicionados()} />} 
                  label="Nenhum"
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.875rem',
                      color: temProdutosAdicionados() ? 'inherit' : '#999'
                    },
                    mr: 0
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {(notaSaida.tipoFrete === 'CIF' || notaSaida.tipoFrete === 'FOB') && (
            <>
              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Frete"
                  type="number"
                  value={notaSaida.valorFrete}
                  disabled={!temProdutosAdicionados()}
                  onChange={(e) => {
                    if (temProdutosAdicionados()) {
                      const valor = parseFloat(e.target.value) || 0;
                      const valorFormatado = Math.round(valor * 100) / 100;
                      handleChange('valorFrete', valorFormatado);
                    }
                  }}
                  onBlur={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    handleChange('valorFrete', parseFloat(valor.toFixed(2)));
                  }}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    bgcolor: temProdutosAdicionados() ? 'inherit' : '#e0e0e0',
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
                  value={notaSaida.valorSeguro}
                  disabled={!temProdutosAdicionados()}
                  onChange={(e) => {
                    if (temProdutosAdicionados()) {
                      const valor = parseFloat(e.target.value) || 0;
                      const valorFormatado = Math.round(valor * 100) / 100;
                      handleChange('valorSeguro', valorFormatado);
                    }
                  }}
                  onBlur={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    handleChange('valorSeguro', parseFloat(valor.toFixed(2)));
                  }}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    bgcolor: temProdutosAdicionados() ? 'inherit' : '#e0e0e0',
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
                  value={notaSaida.outrasDespesas}
                  disabled={!temProdutosAdicionados()}
                  onChange={(e) => {
                    if (temProdutosAdicionados()) {
                      const valor = parseFloat(e.target.value) || 0;
                      const valorFormatado = Math.round(valor * 100) / 100;
                      handleChange('outrasDespesas', valorFormatado);
                    }
                  }}
                  onBlur={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    handleChange('outrasDespesas', parseFloat(valor.toFixed(2)));
                  }}
                  InputProps={{ 
                    inputProps: { step: 0.01, min: 0 },
                    startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
                  }}
                  variant="outlined"
                  sx={{ 
                    bgcolor: temProdutosAdicionados() ? 'inherit' : '#e0e0e0',
                    '& .MuiInputBase-input': { 
                      textAlign: 'right' 
                    }
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            Total da Nota: 
            <Typography component="span" variant="h6" fontWeight={700} color="text.primary" sx={{ ml: 1 }}>
              R$ {(
                notaSaida.itens.reduce((sum, item) => sum + item.valorTotal, 0) +
                parseFloat(notaSaida.valorFrete || 0) +
                parseFloat(notaSaida.valorSeguro || 0) +
                parseFloat(notaSaida.outrasDespesas || 0)
              ).toFixed(2)}
            </Typography>
          </Typography>
        </Box>

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
              value={notaSaida.condicaoPagamentoId}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ 
                bgcolor: '#f5f5f5',
                '& .MuiInputBase-input': {
                  textAlign: 'right'
                }
              }}
            />
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              size="small"
              label="Condição de Pagamento"
              value={notaSaida.condicaoPagamento}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>
        </Grid>

        {parcelasCondicao.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Parcela</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cód. Forma Pgto</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Forma de Pgto</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data Vencimento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valor Parcela</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parcelasCondicao.map((parcela, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{parcela.numeroParcela}</TableCell>
                    <TableCell>{parcela.formaPagamento?.id || '-'}</TableCell>
                    <TableCell>{parcela.formaPagamento?.nome || 'Não informada'}</TableCell>
                    <TableCell>{calcularDataVencimento(parcela)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      R$ {calcularValorParcela(parcela).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              size="small"
              label="Observações"
              value={notaSaida.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações gerais sobre a nota de saída..."
              variant="outlined"
            />
          </Grid>
        </Grid>

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

      <ClienteModal
        open={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onSelect={handleClienteSelect}
        onAddNew={() => setClienteFormModalOpen(true)}
        refreshTrigger={clienteRefreshTrigger}
      />

      <ProdutoModal
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        onSelect={handleProdutoSelect}
        onAddNew={() => setProdutoFormModalOpen(true)}
        refreshTrigger={produtoRefreshTrigger}
      />

      <ClienteModalForm
        open={clienteFormModalOpen}
        onClose={() => setClienteFormModalOpen(false)}
        onSaveSuccess={(novoCliente) => {
          setClienteFormModalOpen(false);
          handleClienteSelect(novoCliente);
          setClienteRefreshTrigger(prev => prev + 1);
        }}
      />

      <ProdutoModalForm
        open={produtoFormModalOpen}
        onClose={() => setProdutoFormModalOpen(false)}
        onSaveSuccess={(novoProduto) => {
          setProdutoFormModalOpen(false);
          handleProdutoSelect(novoProduto);
          setProdutoRefreshTrigger(prev => prev + 1);
        }}
      />
    </Box>
  );
};

export default NotaSaidaFormMUI;
