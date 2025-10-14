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
import ProdutoModal from './ProdutoModal';

const NotaEntradaFormMUI = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [notaEntrada, setNotaEntrada] = useState({
    numero: '',
    modelo: '',
    serie: '',
    fornecedorId: '',
    dataEmissao: '',
    dataChegada: '',
    tipoFrete: 'NENHUM', // CIF, FOB, NENHUM
    valorFrete: 0,
    valorSeguro: 0,
    outrasDespesas: 0,
    codigoCondicaoPagamento: '',
    condicaoPagamento: '',
    observacao: '',
    produtos: [],
    ativo: true
  });

  // Estado para adicionar produtos
  const [produtoAtual, setProdutoAtual] = useState({
    codigoProduto: '',
    produtoNome: '',
    unidade: '',
    quantidade: 0,
    precoUnitario: 0,
    desconto: 0,
    total: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para controlar os modals
  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);
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

  // Funções para manipular os modals
  const handleFornecedorSelect = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    handleChange('fornecedorId', fornecedor.id);
    
    // Preencher condição de pagamento do fornecedor
    preencherCondicaoPagamento(fornecedor);
  };

  const handleProdutoSelect = (produto) => {
    setProdutoAtual(prev => ({
      ...prev,
      codigoProduto: produto.codigo || produto.id.toString(),
      produtoNome: produto.nome,
      unidade: produto.unidade || 'UN',
      precoUnitario: produto.preco || 0
    }));
    calcularTotalProduto({
      ...produtoAtual,
      codigoProduto: produto.codigo || produto.id.toString(),
      produtoNome: produto.nome,
      unidade: produto.unidade || 'UN',
      precoUnitario: produto.preco || 0
    });
  };



  // Função para calcular total do produto atual
  const calcularTotalProduto = () => {
    const { quantidade, precoUnitario, desconto } = produtoAtual;
    const subtotal = quantidade * precoUnitario;
    const total = subtotal - desconto;
    setProdutoAtual(prev => ({ ...prev, total }));
  };

  // Função para adicionar produto à lista
  const adicionarProduto = () => {
    if (produtoAtual.codigoProduto && produtoAtual.quantidade > 0) {
      setNotaEntrada(prev => ({
        ...prev,
        produtos: [...prev.produtos, { ...produtoAtual, id: Date.now() }]
      }));
      // Limpar formulário de produto
      setProdutoAtual({
        codigoProduto: '',
        produtoNome: '',
        unidade: '',
        quantidade: 0,
        precoUnitario: 0,
        desconto: 0,
        total: 0
      });
    }
  };

  // Função para remover produto da lista
  const removerProduto = (id) => {
    setNotaEntrada(prev => ({
      ...prev,
      produtos: prev.produtos.filter(p => p.id !== id)
    }));
  };

  // Função para buscar condição de pagamento do fornecedor
  const preencherCondicaoPagamento = async (fornecedor) => {
    console.log('Preenchendo condição de pagamento para fornecedor:', fornecedor);
    console.log('Campos disponíveis:', Object.keys(fornecedor));
    
    // Se o fornecedor já tem as informações de condição de pagamento
    if (fornecedor.codigoCondicaoPagamento || fornecedor.condicaoPagamento) {
      setNotaEntrada(prev => ({
        ...prev,
        codigoCondicaoPagamento: fornecedor.codigoCondicaoPagamento || '',
        condicaoPagamento: fornecedor.condicaoPagamento || ''
      }));
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
        let descricao = '';
        
        // Verificar possíveis campos de código
        if (fornecedorCompleto.codigoCondicaoPagamento) {
          codigo = fornecedorCompleto.codigoCondicaoPagamento;
        } else if (fornecedorCompleto.condicaoPagamentoId) {
          codigo = fornecedorCompleto.condicaoPagamentoId;
        }
        
        // Se temos um código, buscar a descrição da condição de pagamento
        if (codigo) {
          try {
            const condResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${codigo}`);
            if (condResponse.ok) {
              const condicao = await condResponse.json();
              descricao = condicao.descricao || condicao.nome || '';
            }
          } catch (err) {
            console.log('Erro ao buscar descrição da condição:', err);
          }
        }
        
        setNotaEntrada(prev => ({
          ...prev,
          codigoCondicaoPagamento: codigo,
          condicaoPagamento: descricao
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar condição de pagamento:', error);
    }
  };

  // Atualizar cálculo quando produto atual muda
  useEffect(() => {
    const { quantidade, precoUnitario, desconto } = produtoAtual;
    const subtotal = quantidade * precoUnitario;
    const total = subtotal - desconto;
    setProdutoAtual(prev => ({ ...prev, total }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtoAtual.quantidade, produtoAtual.precoUnitario, produtoAtual.desconto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit 
        ? `http://localhost:8080/notas-entrada/${id}`
        : 'http://localhost:8080/notas-entrada';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaEntrada),
      });

      if (response.ok) {
        navigate('/notas-entrada');
      } else {
        setError('Erro ao salvar nota de entrada');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao salvar nota de entrada');
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
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* linha 2 add produtos */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Grid item sx={{ width: '20%' }}>
            <TextField
              fullWidth
              size="small"
              label="Cód Produto"
              value={produtoAtual.codigoProduto}
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

          <Grid item sx={{ width: '28%' }}>
            <TextField
              fullWidth
              size="small"
              label="Produto"
              value={produtoAtual.produtoNome}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Unidade"
              value={produtoAtual.unidade}
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
              value={produtoAtual.quantidade}
              onChange={(e) => setProdutoAtual(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
              InputProps={{ inputProps: { step: 0.01, min: 0 } }}
              variant="outlined"
            />
          </Grid>

          {/* <Grid item sx={{ width: '20%' }}></Grid> */}

          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Preço Unit."
              type="number"
              value={produtoAtual.precoUnitario}
              onChange={(e) => setProdutoAtual(prev => ({ ...prev, precoUnitario: parseFloat(e.target.value) || 0 }))}
              InputProps={{ 
                inputProps: { step: 0.01, min: 0 },
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '12%' }}>
            <TextField
              fullWidth
              size="small"
              label="Desconto"
              type="number"
              value={produtoAtual.desconto}
              onChange={(e) => setProdutoAtual(prev => ({ ...prev, desconto: parseFloat(e.target.value) || 0 }))}
              InputProps={{ 
                inputProps: { step: 0.01, min: 0 },
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Total"
              type="number"
              value={produtoAtual.total}
              InputProps={{ 
                readOnly: true,
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>
              }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '4%' }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={adicionarProduto}
              disabled={!produtoAtual.codigoProduto || produtoAtual.quantidade <= 0}
              sx={{ minHeight: 40 }}
            >
              <AddIcon />
            </Button>
          </Grid>
        </Grid>

        {/* Tabela de Produtos */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Produto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unid</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Qtd</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Preço Un.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notaEntrada.produtos.map((produto) => (
                <TableRow key={produto.id} hover>
                  <TableCell>{produto.codigoProduto}</TableCell>
                  <TableCell>{produto.produtoNome}</TableCell>
                  <TableCell>{produto.unidade}</TableCell>
                  <TableCell>{produto.quantidade}</TableCell>
                  <TableCell>R$ {produto.precoUnitario.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>R$ {produto.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => removerProduto(produto.id)}
                      sx={{ color: '#dc3545' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {notaEntrada.produtos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Nenhum produto adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
                onChange={(e) => handleChange('tipoFrete', e.target.value)}
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
                  value="NENHUM" 
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
            />
          </Grid>
        </Grid>

        {/* Seção Condição de Pagamento */}
        <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Condição de Pagamento
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="Cód Cond. Pgto"
              value={notaEntrada.codigoCondicaoPagamento}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>

          <Grid item sx={{ width: '20%' }}>
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
        <Typography variant="h6" gutterBottom color="primary" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Observações
        </Typography>
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
      />

      <ProdutoModal
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        onSelect={handleProdutoSelect}
      />
    </Box>
  );
};

export default NotaEntradaFormMUI;