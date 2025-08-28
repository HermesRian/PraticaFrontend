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
  Stack,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Componente Modal de Seleção de Estado
import EstadoModal from '../Estado/EstadoModal';

// Componente de formulário de cidade
const CidadeFormMUI = () => {
  const [cidade, setCidade] = useState({
    nome: '',
    codigoIbge: '',
    estadoId: '',
    estadoNome: 'Selecione um Estado',
    ativo: true,
    dataCadastro: '',
    ultimaModificacao: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/cidades/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const cidadeAtualizada = {
            nome: data.nome || '',
            codigoIbge: data.codigoIbge || '',
            estadoId: data.estadoId || '',
            estadoNome: data.estadoNome || 'Selecione um Estado',
            ativo: data.ativo !== undefined ? data.ativo : true,
            dataCadastro: data.dataCadastro || '',
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
    
    // Limpa o erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setCidade({ ...cidade, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!cidade.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!cidade.codigoIbge?.trim()) {
      errors.codigoIbge = 'Este campo é obrigatório';
    }
    
    if (!cidade.estadoId) {
      errors.estadoId = 'É necessário selecionar um estado';
    }
    
    // Se há erros, exibe e para a execução
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Formatando os dados para corresponder ao modelo esperado pelo backend
    const cidadeFormatada = {
      nome: cidade.nome.trim(),
      codigoIbge: cidade.codigoIbge.trim(),
      estadoId: cidade.estadoId,
      ativo: cidade.ativo
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
          return response.text().then(text => {
            console.error('Erro do servidor:', text);
            throw new Error(`Erro do servidor: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then(() => {
        navigate('/cidades');
      })
      .catch((error) => {
        console.error('Erro ao salvar cidade:', error);
        setErrorMessage('Erro ao salvar cidade. Tente novamente.');
      });
  };

  const handleCancel = () => {
    navigate('/cidades');
  };

  const handleOpenEstadoModal = () => {
    setIsEstadoModalOpen(true);
  };

  const handleCloseEstadoModal = () => {
    setIsEstadoModalOpen(false);
  };

  const handleEstadoSelecionado = (estado) => {
    setCidade({ ...cidade, estadoId: estado.id, estadoNome: `${estado.nome} - ${estado.uf}` });
    
    // Limpa o erro do campo estado se existir
    if (fieldErrors.estadoId) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.estadoId;
        return newErrors;
      });
    }
    
    setIsEstadoModalOpen(false);
  };

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
          width: '90%',
          maxWidth: 900,
          minHeight: 'auto',
          mx: 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          pb: 0,
          borderRadius: 2,
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
            {id ? 'Editar Cidade' : 'Cadastrar Nova Cidade'}
          </Typography>

          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cidade.ativo}
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

        {/* Linha 1: Código e Nome da Cidade */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item sx={{ width: '8%', minWidth: 100 }}>
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

          <Grid item sx={{ width: '65%' }}>
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
        </Grid>

        {/* Linha 2: Código IBGE e Estado */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Código IBGE"
              name="codigoIbge"
              value={cidade.codigoIbge}
              onChange={handleChange}
              placeholder="Ex: 3550308"
              variant="outlined"
              error={!!fieldErrors.codigoIbge}
              helperText={fieldErrors.codigoIbge || ''}
            />
          </Grid>

          <Grid item sx={{ width: '50%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Estado"
                value={cidade.estadoNome}
                InputProps={{ readOnly: true }}
                variant="outlined"
                error={!!fieldErrors.estadoId}
                helperText={fieldErrors.estadoId || ''}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa'
                  }
                }}
                onClick={handleOpenEstadoModal}
              />
              <IconButton
                onClick={handleOpenEstadoModal}
                color="primary"
                size="medium"
                sx={{ 
                  border: '1px solid #1976d2',
                  borderRadius: 1,
                  p: 1,
                  '&:hover': {
                    backgroundColor: '#1976d2',
                    color: 'white'
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
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
            {cidade.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(cidade.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {cidade.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(cidade.ultimaModificacao).toLocaleString('pt-BR')}
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

      {/* Modal de seleção de estados */}
      {isEstadoModalOpen && (
        <EstadoModal
          onClose={handleCloseEstadoModal}
          onEstadoSelecionado={handleEstadoSelecionado}
        />
      )}
    </Box>
  );
};

export default CidadeFormMUI;
