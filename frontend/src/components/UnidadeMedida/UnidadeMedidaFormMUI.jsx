import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Importações do Material-UI
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  Stack
} from '@mui/material';

// Componente de formulário de unidade de medida
const UnidadeMedidaFormMUI = ({ id: propId, isModal = false, onClose }) => {
  const [unidadeMedida, setUnidadeMedida] = useState({
    nome: '',
    ativo: true,
    dataCriacao: '',
    ultimaModificacao: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/unidades-medida/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const unidadeMedidaAtualizada = {
            nome: data.nome || '',
            ativo: data.ativo ?? true,
            dataCriacao: data.dataCriacao || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Unidade de medida final:', unidadeMedidaAtualizada);
          setUnidadeMedida(unidadeMedidaAtualizada);
        })
        .catch((error) => console.error('Erro ao buscar unidade de medida:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limpa o erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setUnidadeMedida({ ...unidadeMedida, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!unidadeMedida.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    // Se há erros, exibe e para a execução
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Formatando os dados para corresponder ao modelo esperado pelo backend
    const unidadeMedidaFormatada = {
      ...unidadeMedida,
    };

    console.log('Dados enviados:', unidadeMedidaFormatada);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/unidades-medida/${id}` : 'http://localhost:8080/unidades-medida';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unidadeMedidaFormatada),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Erro do servidor:', text);
            throw new Error(`Erro do servidor: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (isModal) {
          onClose(data); // Passa a unidade criada/atualizada
        } else {
          navigate('/unidades-medida');
        }
      })
      .catch((error) => {
        console.error('Erro ao salvar unidade de medida:', error);
        setErrorMessage('Erro ao salvar unidade de medida. Tente novamente.');
      });
  };

  const handleCancel = () => {
    if (isModal) {
      onClose();
    } else {
      navigate('/unidades-medida');
    }
  };

  return (
    <Box sx={{ 
      padding: isModal ? 0 : { xs: 2, md: 3 }, 
      bgcolor: isModal ? 'transparent' : '#f8f9fa', 
      minHeight: isModal ? 'auto' : '100vh',
      paddingBottom: isModal ? 0 : 0.5
    }}>
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        elevation={isModal ? 0 : 10}
        sx={{
          width: isModal ? '100%' : '90%',
          maxWidth: isModal ? 'none' : 900,
          minHeight: 'auto',
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
        {/* Cabeçalho com título e switch Ativo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          {/* Espaço vazio à esquerda para centralizar o título */}
          <Box sx={{ width: 120 }}></Box>
          
          {/* Título centralizado */}
          <Typography 
            variant="h5" 
            component="h1" 
            align="center" 
            sx={{ color: '#333', fontWeight: 600, flex: 1 }}
          >
            {id ? 'Editar Unidade de Medida' : 'Cadastrar Nova Unidade de Medida'}
          </Typography>

          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={unidadeMedida.ativo}
                  onChange={handleChange}
                  name="ativo"
                  color="primary"
                  disabled={!id} // Desabilita durante cadastro (quando não há id)
                />
              }
              label="Ativo"
              sx={{ mr: 0 }}
            />
          </Box>
        </Box>

        {/* Linha 1: Código, Nome */}
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

          <Grid item sx={{ width: '75%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nome"
              name="nome"
              value={unidadeMedida.nome}
              onChange={handleChange}
              placeholder="Nome da unidade de medida (ex: Unidade, Metro, Litro)"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
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

        {/* Botões e Informações de registro */}
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
          {/* Informações de registro - lado esquerdo */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {unidadeMedida.dataCriacao && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(unidadeMedida.dataCriacao).toLocaleString('pt-BR')}
              </Typography>
            )}
            {unidadeMedida.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(unidadeMedida.ultimaModificacao).toLocaleString('pt-BR')}
              </Typography>
            )}
          </Stack>

          {/* Botões - lado direito */}
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

export default UnidadeMedidaFormMUI;
