import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Alert,
  Divider,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const ContaPagarFormMUI = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [conta, setConta] = useState({
    numero: '',
    modelo: '',
    serie: '',
    parcela: 1,
    valor: '',
    desconto: 0,
    multa: 0,
    juro: 0,
    fornecedorId: '',
    formaPagamentoId: '',
    dataVencimento: '',
    dataEmissao: '',
    descricao: '',
    status: 'PENDENTE'
  });

  const [fornecedores, setFornecedores] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    carregarDados();
    if (isEditMode) {
      carregarConta();
    }
  }, [id]);

  const carregarDados = async () => {
    try {
      const [fornecedoresRes, formasPagamentoRes] = await Promise.all([
        fetch('http://localhost:8080/fornecedores'),
        fetch('http://localhost:8080/formas-pagamento')
      ]);

      if (fornecedoresRes.ok) {
        const fornecedoresData = await fornecedoresRes.json();
        setFornecedores(fornecedoresData);
      }

      if (formasPagamentoRes.ok) {
        const formasPagamentoData = await formasPagamentoRes.json();
        setFormasPagamento(formasPagamentoData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do formulário');
    }
  };

  const carregarConta = async () => {
    try {
      const response = await fetch(`http://localhost:8080/contas-pagar/${id}`);
      if (response.ok) {
        const data = await response.json();
        setConta({
          numero: data.numero || '',
          modelo: data.modelo || '',
          serie: data.serie || '',
          parcela: data.parcela || 1,
          valor: data.valor || '',
          desconto: data.desconto || 0,
          multa: data.multa || 0,
          juro: data.juro || 0,
          fornecedorId: data.fornecedorId || '',
          formaPagamentoId: data.formaPagamentoId || '',
          dataVencimento: data.dataVencimento ? data.dataVencimento.split('T')[0] : '',
          dataEmissao: data.dataEmissao ? data.dataEmissao.split('T')[0] : '',
          descricao: data.descricao || '',
          status: data.status || 'PENDENTE'
        });

        // Buscar fornecedor selecionado
        if (data.fornecedorId) {
          const fornecedor = fornecedores.find(f => f.id === data.fornecedorId);
          setFornecedorSelecionado(fornecedor || null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
      setError('Erro ao carregar conta a pagar');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConta(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo ao editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFornecedorChange = (event, newValue) => {
    setFornecedorSelecionado(newValue);
    setConta(prev => ({ ...prev, fornecedorId: newValue?.id || '' }));
    if (errors.fornecedorId) {
      setErrors(prev => ({ ...prev, fornecedorId: '' }));
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!conta.parcela || conta.parcela < 1) {
      novosErros.parcela = 'Parcela é obrigatória e deve ser maior que 0';
    }

    if (!conta.valor || parseFloat(conta.valor) <= 0) {
      novosErros.valor = 'Valor é obrigatório e deve ser maior que 0';
    }

    if (!conta.fornecedorId) {
      novosErros.fornecedorId = 'Fornecedor é obrigatório';
    }

    if (!conta.dataVencimento) {
      novosErros.dataVencimento = 'Data de vencimento é obrigatória';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');

    const contaData = {
      numero: conta.numero || null,
      modelo: conta.modelo || null,
      serie: conta.serie || null,
      parcela: parseInt(conta.parcela),
      valor: parseFloat(conta.valor),
      desconto: parseFloat(conta.desconto) || 0,
      multa: parseFloat(conta.multa) || 0,
      juro: parseFloat(conta.juro) || 0,
      valorBaixa: null,
      fornecedorId: conta.fornecedorId,
      formaPagamentoId: conta.formaPagamentoId || null,
      notaEntradaId: null, // Conta avulsa
      dataVencimento: conta.dataVencimento,
      dataEmissao: conta.dataEmissao || null,
      dataBaixa: null,
      dataPagamento: null,
      dataCancelamento: null,
      status: 'PENDENTE',
      descricao: conta.descricao || null,
      justificativaCancelamento: null
    };

    try {
      const url = isEditMode 
        ? `http://localhost:8080/contas-pagar/${id}`
        : 'http://localhost:8080/contas-pagar';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contaData),
      });

      if (response.ok) {
        alert(`Conta a pagar ${isEditMode ? 'atualizada' : 'cadastrada'} com sucesso!`);
        navigate('/contas-pagar');
      } else {
        const errorText = await response.text();
        setError(`Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} conta: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      setError('Erro ao salvar conta a pagar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/contas-pagar');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const calcularValorTotal = () => {
    const valor = parseFloat(conta.valor) || 0;
    const desconto = parseFloat(conta.desconto) || 0;
    const multa = parseFloat(conta.multa) || 0;
    const juro = parseFloat(conta.juro) || 0;
    return valor - desconto + multa + juro;
  };

  return (
    <Box sx={{ 
      padding: { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <Paper 
        elevation={10}
        sx={{
          width: '95%',
          maxWidth: 1400,
          mx: 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {isEditMode ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Seção 1: Dados do Documento */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Dados do Documento
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Número"
                name="numero"
                value={conta.numero}
                onChange={handleChange}
                placeholder="DOC-001"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Modelo"
                name="modelo"
                value={conta.modelo}
                onChange={handleChange}
                placeholder="55"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Série"
                name="serie"
                value={conta.serie}
                onChange={handleChange}
                placeholder="1"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Parcela *"
                name="parcela"
                type="number"
                value={conta.parcela}
                onChange={handleChange}
                error={Boolean(errors.parcela)}
                helperText={errors.parcela}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Seção 2: Valores */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Valores
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Valor *"
                name="valor"
                type="number"
                value={conta.valor}
                onChange={handleChange}
                error={Boolean(errors.valor)}
                helperText={errors.valor}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Desconto"
                name="desconto"
                type="number"
                value={conta.desconto}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Multa"
                name="multa"
                type="number"
                value={conta.multa}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Juros"
                name="juro"
                type="number"
                value={conta.juro}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Valor Total: <strong>{formatCurrency(calcularValorTotal())}</strong> (Valor - Desconto + Multa + Juros)
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Seção 3: Vínculos */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Vínculos
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item sx={{ width: '20%' }}>
              <Autocomplete
                size="small"
                options={fornecedores}
                getOptionLabel={(option) => 
                  option.razaoSocial 
                    ? `${option.razaoSocial} ${option.nomeFantasia ? `(${option.nomeFantasia})` : ''}` 
                    : option.nome || ''
                }
                value={fornecedorSelecionado}
                onChange={handleFornecedorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fornecedor *"
                    error={Boolean(errors.fornecedorId)}
                    helperText={errors.fornecedorId}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item sx={{ width: '20%' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  name="formaPagamentoId"
                  value={conta.formaPagamentoId}
                  onChange={handleChange}
                  label="Forma de Pagamento"
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {formasPagamento.map((forma) => (
                    <MenuItem key={forma.id} value={forma.id}>
                      {forma.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Seção 4: Datas */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Datas
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Data de Emissão"
                name="dataEmissao"
                type="date"
                value={conta.dataEmissao}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Data de Vencimento *"
                name="dataVencimento"
                type="date"
                value={conta.dataVencimento}
                onChange={handleChange}
                error={Boolean(errors.dataVencimento)}
                helperText={errors.dataVencimento}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Seção 5: Observações */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Observações
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} style={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição"
                name="descricao"
                value={conta.descricao}
                onChange={handleChange}
                placeholder="Informações adicionais sobre a conta..."
              />
            </Grid>
          </Grid>

          {/* Botões */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ContaPagarFormMUI;
