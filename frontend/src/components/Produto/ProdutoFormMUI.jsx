import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Alert,
  InputAdornment,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ProdutoFormMUI = ({ id: propId, isModal = false, onClose }) => {
  const [produto, setProduto] = useState({
    nome: '',
    quantidadeEstoque: '',
    descricao: '',
    codigo: '',
    ativo: true,
    marcaId: '',
    marcaDescricao: '',
    unidadeMedidaId: '',
    unidadeMedidaDescricao: '',
    categoriaId: '',
    categoriaDescricao: '',
    valorCompra: '',
    valorVenda: '',
    quantidadeMinima: '1',
    percentualLucro: '',
    observacoes: '',
    dataCriacao: '',
    ultimaModificacao: '',
  });

  const [marcas, setMarcas] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/marcas').then(res => res.json()).catch(() => []),
      fetch('http://localhost:8080/unidades-medida').then(res => res.json()).catch(() => []),
      fetch('http://localhost:8080/categorias').then(res => res.json()).catch(() => [])
    ])
    .then(([marcasData, unidadesMedidaData, categoriasData]) => {
      setMarcas(marcasData);
      setUnidadesMedida(unidadesMedidaData);
      setCategorias(categoriasData);
    })
    .catch(error => console.error('Erro ao carregar dados auxiliares:', error));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/produtos/${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          console.log('Dados recebidos do backend:', data);

          let marcaDescricao = '';
          if (data.marcaId) {
            try {
              const marcaResponse = await fetch(`http://localhost:8080/marcas/${data.marcaId}`);
              if (marcaResponse.ok) {
                const marcaData = await marcaResponse.json();
                marcaDescricao = marcaData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar marca:', error);
            }
          }

          let unidadeMedidaDescricao = '';
          if (data.unidadeMedidaId) {
            try {
              const unidadeResponse = await fetch(`http://localhost:8080/unidades-medida/${data.unidadeMedidaId}`);
              if (unidadeResponse.ok) {
                const unidadeData = await unidadeResponse.json();
                unidadeMedidaDescricao = unidadeData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar unidade de medida:', error);
            }
          }

          let categoriaDescricao = '';
          if (data.categoriaId) {
            try {
              const categoriaResponse = await fetch(`http://localhost:8080/categorias/${data.categoriaId}`);
              if (categoriaResponse.ok) {
                const categoriaData = await categoriaResponse.json();
                categoriaDescricao = categoriaData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar categoria:', error);
            }
          }
            
          const produtoAtualizado = {
            ...data,
            marcaDescricao: marcaDescricao,
            unidadeMedidaDescricao: unidadeMedidaDescricao,
            categoriaDescricao: categoriaDescricao,
            valorCompra: data.valorCompra ? data.valorCompra.toString() : '',
            valorVenda: data.valorVenda ? data.valorVenda.toString() : '',
            percentualLucro: data.percentualLucro ? data.percentualLucro.toString() : '',
            quantidadeEstoque: data.quantidadeEstoque ? data.quantidadeEstoque.toString() : '',
            quantidadeMinima: data.quantidadeMinima ? data.quantidadeMinima.toString() : '1',
            dataCriacao: data.dataCriacao || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Produto final com dados buscados:', produtoAtualizado);
          setProduto(produtoAtualizado);
        })
        .catch((error) => console.error('Erro ao buscar produto:', error));
    }
  }, [id]);

  // Função para calcular lucro automaticamente
  const calcularLucro = (valorCompra, valorVenda) => {
    const compra = parseFloat(valorCompra) || 0;
    const venda = parseFloat(valorVenda) || 0;
    
    if (compra > 0 && venda > 0) {
      const lucro = ((venda - compra) / compra) * 100;
      return lucro.toFixed(2);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setProduto({ ...produto, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNumericChange = (e, maxLength, isDecimal = false) => {
    const { name } = e.target;
    let value = isDecimal ? 
      e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.') :
      e.target.value.replace(/[^0-9]/g, '');
    
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    const updatedProduto = { ...produto, [name]: value };
    
    // Calcular lucro automaticamente se alterou valor de compra ou venda
    if (name === 'valorCompra' || name === 'valorVenda') {
      const valorCompra = name === 'valorCompra' ? value : produto.valorCompra;
      const valorVenda = name === 'valorVenda' ? value : produto.valorVenda;
      updatedProduto.percentualLucro = calcularLucro(valorCompra, valorVenda);
    }
    
    setProduto(updatedProduto);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    const errors = {};
    
    if (!produto.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!produto.codigo?.trim()) {
      errors.codigo = 'Este campo é obrigatório';
    }
    
    
    if (!produto.quantidadeEstoque) {
      errors.quantidadeEstoque = 'Este campo é obrigatório';
    } else if (isNaN(parseInt(produto.quantidadeEstoque)) || parseInt(produto.quantidadeEstoque) < 0) {
      errors.quantidadeEstoque = 'Digite um valor válido maior ou igual a zero';
    }

    if (produto.valorCompra && (isNaN(parseFloat(produto.valorCompra)) || parseFloat(produto.valorCompra) < 0)) {
      errors.valorCompra = 'Digite um valor válido maior ou igual a zero';
    }

    if (produto.valorVenda && (isNaN(parseFloat(produto.valorVenda)) || parseFloat(produto.valorVenda) < 0)) {
      errors.valorVenda = 'Digite um valor válido maior ou igual a zero';
    }

    if (produto.percentualLucro && (isNaN(parseFloat(produto.percentualLucro)) || parseFloat(produto.percentualLucro) < 0)) {
      errors.percentualLucro = 'Digite um valor válido maior ou igual a zero';
    }

    if (produto.quantidadeMinima && (isNaN(parseInt(produto.quantidadeMinima)) || parseInt(produto.quantidadeMinima) < 1)) {
      errors.quantidadeMinima = 'Digite um valor válido maior que zero';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const produtoFormatado = {
      ...produto,
      valorCompra: produto.valorCompra ? parseFloat(produto.valorCompra) : null,
      valorVenda: produto.valorVenda ? parseFloat(produto.valorVenda) : null,
      percentualLucro: produto.percentualLucro ? parseFloat(produto.percentualLucro) : null,
      quantidadeEstoque: produto.quantidadeEstoque ? parseInt(produto.quantidadeEstoque) : 0,
      quantidadeMinima: produto.quantidadeMinima ? parseInt(produto.quantidadeMinima) : 1,
      marcaId: produto.marcaId || null,
      unidadeMedidaId: produto.unidadeMedidaId || null,
      categoriaId: produto.categoriaId || null,
    };

    console.log('Dados enviados:', produtoFormatado);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/produtos/${id}` : 'http://localhost:8080/produtos';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produtoFormatado),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            let errorObj = null;
            try {
              errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar produto';
              console.error('Resposta do servidor:', errorObj);
            } catch {
              error = text || 'Erro ao salvar produto';
              console.error('Resposta do servidor (texto):', text);
            }
            
            if (errorObj && errorObj.erro) {
              const errorMessage = errorObj.erro;
              if (errorMessage.includes('código') || errorMessage.includes('Código')) {
                setFieldErrors(prev => ({
                  ...prev,
                  codigo: errorMessage
                }));
                throw new Error('');
              }
            }
            
            throw new Error(error);
          });
        }
        return response.json();
      })
      .then(() => {
        if (isModal) {
          onClose();
        } else {
          navigate('/produtos');
        }
      })
      .catch((error) => {
        console.error('Erro capturado:', error);
        if (error.message.trim()) {
          setErrorMessage(error.message);
        }
      });
  };

  const handleCancel = () => {
    if (isModal) {
      onClose();
    } else {
      navigate('/produtos');
    }
  };

  return (
    <Box sx={{ 
      padding: isModal ? 0 : { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa', 
      minHeight: isModal ? 'auto' : '100vh',
      paddingBottom: isModal ? 0 : 0.5
    }}>
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        elevation={isModal ? 0 : 10}
        sx={{
          width: isModal ? '100%' : '95%',
          maxWidth: isModal ? 'none' : 1390,
          minHeight: isModal ? 'auto' : '70vh',
          mx: isModal ? 0 : 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          pb: 0,
          borderRadius: isModal ? 0 : 2,
          overflow: 'hidden',
          position: 'relative',
          '& .MuiFormLabel-root': {
            display: 'flex',
            alignItems: 'flex-start',
            ml: -0.5,
          },
          '& .MuiFormControl-root': {
            width: '100%'
          }
        }}
      >
        {/* Cabeçalho */}
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
            {id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </Typography>
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={produto.ativo}
                  onChange={handleChange}
                  name="ativo"
                  color="primary"
                  disabled={!id}
                />
              }
              label="Ativo"
              sx={{ mr: 0 }}
            />
          </Box>
        </Box>

        {/* Linha 1: Código, Produto, Descrição, Marca, Código do Produto */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '6%', minWidth: 80 }}>
            <TextField
              fullWidth
              size="small"
              label="Código"
              name="id"
              value={id || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
              disabled
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              required
              size="small"
              label="Produto"
              name="nome"
              value={produto.nome}
              onChange={handleChange}
              placeholder="Produto"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>
          <Grid item sx={{ width: '14%' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Unidade de Medida</InputLabel>
              <Select
                name="unidadeMedidaId"
                value={produto.unidadeMedidaId}
                onChange={handleChange}
                label="Unidade de Medida"
              >
                <MenuItem value="">Selecione...</MenuItem>
                {unidadesMedida.map((unidade) => (
                  <MenuItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="Descrição"
              name="descricao"
              value={produto.descricao}
              onChange={handleChange}
              placeholder="Descrição do produto"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '10%', minWidth: 80 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Marca</InputLabel>
              <Select
                name="marcaId"
                value={produto.marcaId}
                onChange={handleChange}
                label="Marca"
              >
                <MenuItem value="">Selecione...</MenuItem>
                {marcas.map((marca) => (
                  <MenuItem key={marca.id} value={marca.id}>
                    {marca.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Linha 2: Valor de Compra, Valor de Venda, Lucro */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              label="Valor de Compra"
              name="valorCompra"
              value={produto.valorCompra}
              onChange={e => handleNumericChange(e, 10, true)}
              variant="outlined"
              error={!!fieldErrors.valorCompra}
              helperText={fieldErrors.valorCompra || ''}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                inputMode: 'decimal'
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              label="Valor de Venda"
              name="valorVenda"
              value={produto.valorVenda}
              onChange={e => handleNumericChange(e, 10, true)}
              variant="outlined"
              error={!!fieldErrors.valorVenda}
              helperText={fieldErrors.valorVenda || ''}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                inputMode: 'decimal'
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              label="Lucro"
              name="percentualLucro"
              value={produto.percentualLucro}
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Linha 3: Quantidade em Estoque, Unidade de Medida, Categoria, Quantidade Mínima */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              required
              size="small"
              label="Quantidade em Estoque"
              name="quantidadeEstoque"
              value={produto.quantidadeEstoque}
              onChange={e => handleNumericChange(e, 10)}
              variant="outlined"
              error={!!fieldErrors.quantidadeEstoque}
              helperText={fieldErrors.quantidadeEstoque || ''}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoriaId"
                value={produto.categoriaId}
                onChange={handleChange}
                label="Categoria"
              >
                <MenuItem value="">Selecione...</MenuItem>
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              size="small"
              label="Quantidade Mínima"
              name="quantidadeMinima"
              value={produto.quantidadeMinima}
              onChange={e => handleNumericChange(e, 10)}
              variant="outlined"
              error={!!fieldErrors.quantidadeMinima}
              helperText={fieldErrors.quantidadeMinima || ''}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>
        </Grid>

        {/* Linha 4: Observações */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item sx={{ width: '100%', minWidth: 80 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Observações"
              name="observacoes"
              value={produto.observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o produto"
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Mensagem de erro */}
        {errorMessage && (
          <Alert 
            severity="error" 
            variant="filled"
            onClose={() => setErrorMessage('')}
            sx={{ mb: 2, mt: 2 }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Registro e botões */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: '1px solid #eee',
            position: 'sticky',
            bottom: '5px',
            backgroundColor: 'white',
            zIndex: 10,
            pb: 0.5,
            boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Registros */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {produto.dataCriacao && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(produto.dataCriacao).toLocaleString('pt-BR')}
              </Typography>
            )}
            {produto.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(produto.ultimaModificacao).toLocaleString('pt-BR')}
              </Typography>
            )}
          </Stack>

          {/* Botões */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              size="medium"
              sx={{ minWidth: 100, py: 1 }}
            >
              Salvar
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              color="inherit"
              type="button"
              size="medium"
              sx={{ minWidth: 100, py: 1 }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProdutoFormMUI;