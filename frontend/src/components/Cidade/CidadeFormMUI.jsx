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
  Stack
} from '@mui/material';

const CidadeFormMUI = ({ id: propId, isModal = false, onClose }) => {
  const [cidade, setCidade] = useState({
    nome: '',
    codigoIbge: '',
    estadoId: '',
    estadoDescricao: '',
    ativo: true,
    dataCriacao: '',
    ultimaModificacao: '',
    ddd: '',
  });

  const [estados, setEstados] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  useEffect(() => {
    fetch('http://localhost:8080/estados')
      .then(res => res.json())
      .then(data => setEstados(data))
      .catch(error => console.error('Erro ao carregar estados:', error));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/cidades/${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          console.log('Dados recebidos do backend:', data);

          let estadoDescricao = '';
          if (data.estadoId) {
            try {
              const estadoResponse = await fetch(`http://localhost:8080/estados/${data.estadoId}`);
              if (estadoResponse.ok) {
                const estadoData = await estadoResponse.json();
                estadoDescricao = `${estadoData.nome} - ${estadoData.uf}`;
              }
            } catch (error) {
              console.error('Erro ao buscar estado:', error);
            }
          }
            
          const cidadeAtualizada = {
            ...data,
            estadoDescricao: estadoDescricao,
            dataCriacao: data.dataCriacao || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Cidade final:', cidadeAtualizada);
          setCidade(cidadeAtualizada);
        })
        .catch((error) => console.error('Erro ao buscar cidade:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'estadoId') {
      const estadoSelecionado = estados.find(e => e.id === parseInt(value));
      setCidade({ 
        ...cidade, 
        [name]: value,
        estadoDescricao: estadoSelecionado ? `${estadoSelecionado.nome} - ${estadoSelecionado.uf}` : ''
      });
    } else {
      setCidade({ ...cidade, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleNumericChange = (e, maxLength) => {
    const { name } = e.target;
    let value = e.target.value.replace(/[^0-9]/g, '');
    
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
    
    setCidade({ ...cidade, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    const errors = {};
    
    if (!cidade.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }

    if (!cidade.estadoId) {
      errors.estadoId = 'Selecione um estado';
    }

    if (cidade.codigoIbge && cidade.codigoIbge.length !== 7) {
      errors.codigoIbge = 'O código IBGE deve ter exatamente 7 dígitos';
    }

    if (cidade.ddd && (cidade.ddd.length < 2 || cidade.ddd.length > 2)) {
      errors.ddd = 'O DDD deve ter exatamente 2 dígitos';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const cidadeFormatada = {
      ...cidade,
      nome: cidade.nome?.trim(),
      codigoIbge: cidade.codigoIbge || null,
      estadoId: cidade.estadoId ? parseInt(cidade.estadoId) : null,
      ddd: cidade.ddd ? parseInt(cidade.ddd) : null,
    };

    console.log('Dados enviados:', cidadeFormatada);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/cidades/${id}` : 'http://localhost:8080/cidades';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cidadeFormatada),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            let errorObj = null;
            try {
              errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar cidade';
              console.error('Resposta do servidor:', errorObj);
            } catch (e) {
              error = text || 'Erro ao salvar cidade';
              console.error('Resposta do servidor (texto):', text);
            }
            
            if (errorObj && errorObj.erro) {
              const errorMessage = errorObj.erro;
              if (errorMessage.includes('nome') || errorMessage.includes('Nome')) {
                setFieldErrors(prev => ({
                  ...prev,
                  nome: errorMessage
                }));
                throw new Error('');
              }
              if (errorMessage.includes('IBGE') || errorMessage.includes('ibge')) {
                setFieldErrors(prev => ({
                  ...prev,
                  codigoIbge: errorMessage
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
          navigate('/cidades');
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
      navigate('/cidades');
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
            {id ? 'Editar Cidade' : 'Cadastrar Nova Cidade'}
          </Typography>
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cidade.ativo}
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

        {/* Linha 1: Código e Nome */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '6%', minWidth: 120 }}>
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

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nome da Cidade"
              name="nome"
              value={cidade.nome}
              onChange={handleChange}
              placeholder="Nome da cidade"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>
          <Grid item sx={{ width: '15%' }}>
            <TextField
              fullWidth
              size="small"
              label="Código IBGE"
              name="codigoIbge"
              value={cidade.codigoIbge}
              onChange={e => handleNumericChange(e, 7)}
              variant="outlined"
              error={!!fieldErrors.codigoIbge}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
        </Grid>

          <Grid item sx={{ width: '10%' }}>
            <TextField
              fullWidth
              size="small"
              label="DDD"
              name="ddd"
              value={cidade.ddd}
              onChange={e => handleNumericChange(e, 2)}
              variant="outlined"
              error={!!fieldErrors.ddd}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '25%' }}>
            <FormControl fullWidth size="small" error={!!fieldErrors.estadoId}>
              <InputLabel>Estado *</InputLabel>
              <Select
                name="estadoId"
                value={cidade.estadoId}
                onChange={handleChange}
                label="Estado *"
              >
                <MenuItem value="">Selecione um estado...</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado.id} value={estado.id}>
                    {estado.nome} - {estado.uf}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.estadoId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {fieldErrors.estadoId}
                </Typography>
              )}
            </FormControl>
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
            {cidade.dataCriacao && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(cidade.dataCriacao).toLocaleString('pt-BR')}
              </Typography>
            )}
            {cidade.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(cidade.ultimaModificacao).toLocaleString('pt-BR')}
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

export default CidadeFormMUI;