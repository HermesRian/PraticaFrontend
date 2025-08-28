import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  InputAdornment,
  Stack
} from '@mui/material';

const ProdutoForm = ({ id: propId, isModal = false, onClose }) => {
  const [produto, setProduto] = useState({
    nome: '',
    preco: '',
    quantidadeEstoque: '',
    descricao: '',
    codigo: '',
    ativo: true
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/produtos/${id}`)
        .then(response => response.json())
        .then(data => {
          setProduto({
            ...data,
            preco: data.preco.toString()
          });
        })
        .catch(error => {
          console.error('Erro ao carregar produto:', error);
          setErrorMessage('Erro ao carregar dados do produto');
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (type === 'checkbox') {
      setProduto(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'preco') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setProduto(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'quantidadeEstoque') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setProduto(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setProduto(prev => ({ ...prev, [name]: value }));
    }
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
    
    if (!produto.preco) {
      errors.preco = 'Este campo é obrigatório';
    } else if (isNaN(parseFloat(produto.preco)) || parseFloat(produto.preco) <= 0) {
      errors.preco = 'Digite um valor válido maior que zero';
    }
    
    if (!produto.quantidadeEstoque) {
      errors.quantidadeEstoque = 'Este campo é obrigatório';
    } else if (isNaN(parseInt(produto.quantidadeEstoque)) || parseInt(produto.quantidadeEstoque) < 0) {
      errors.quantidadeEstoque = 'Digite um valor válido maior ou igual a zero';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const produtoFormatado = {
      ...produto,
      preco: parseFloat(produto.preco),
      quantidadeEstoque: parseInt(produto.quantidadeEstoque)
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/produtos/${id}` : 'http://localhost:8080/produtos';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produtoFormatado),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            let error;
            try {
              const errorObj = JSON.parse(text);
              error = errorObj.message || 'Erro desconhecido ao salvar produto';
            } catch (e) {
              error = text || 'Erro ao salvar produto';
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
        console.error('Erro:', error);
        setErrorMessage(error.message);
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
          maxWidth: isModal ? 'none' : 1200,
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

        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '10%', minWidth: 100 }}>
            <TextField
              fullWidth
              size="small"
              label="Código"
              name="codigo"
              value={produto.codigo}
              onChange={handleChange}
              variant="outlined"
              required
              error={!!fieldErrors.codigo}
              helperText={fieldErrors.codigo || ''}
            />
          </Grid>

          <Grid item sx={{ width: '40%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nome"
              name="nome"
              value={produto.nome}
              onChange={handleChange}
              placeholder="Nome do produto"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Preço"
              name="preco"
              value={produto.preco}
              onChange={handleChange}
              variant="outlined"
              error={!!fieldErrors.preco}
              helperText={fieldErrors.preco || ''}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                inputMode: 'decimal'
              }}
            />
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Quantidade em Estoque"
              name="quantidadeEstoque"
              value={produto.quantidadeEstoque}
              onChange={handleChange}
              variant="outlined"
              error={!!fieldErrors.quantidadeEstoque}
              helperText={fieldErrors.quantidadeEstoque || ''}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Descrição"
              name="descricao"
              value={produto.descricao}
              onChange={handleChange}
              placeholder="Descrição detalhada do produto"
              variant="outlined"
            />
          </Grid>
        </Grid>

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
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {produto.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(produto.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {produto.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(produto.ultimaModificacao).toLocaleString('pt-BR')}
              </Typography>
            )}
          </Stack>

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

export default ProdutoForm;
