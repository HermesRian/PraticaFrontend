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

// Componente Modal de Seleção de País
import PaisModal from '../Pais/PaisModal';

// Componente de formulário de estado
const EstadoFormMUI = () => {
  const [estado, setEstado] = useState({
    nome: '',
    uf: '',
    paisId: '',
    paisNome: 'Selecione um País',
    ativo: true,
    dataCadastro: '',
    ultimaModificacao: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/estados/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const estadoAtualizado = {
            nome: data.nome || '',
            uf: data.uf || '',
            paisId: data.paisId || '',
            paisNome: data.paisNome || 'Selecione um País',
            ativo: data.ativo !== undefined ? data.ativo : true,
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Estado final:', estadoAtualizado);
          setEstado(estadoAtualizado);
        })
        .catch((error) => console.error('Erro ao buscar estado:', error));
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
    
    // Converte UF para maiúscula automaticamente
    let finalValue = name === 'uf' ? value.toUpperCase() : value;
    
    setEstado({ ...estado, [name]: type === 'checkbox' ? checked : finalValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!estado.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!estado.uf?.trim()) {
      errors.uf = 'Este campo é obrigatório';
    } else if (estado.uf.length !== 2) {
      errors.uf = 'UF deve ter exatamente 2 caracteres (ex: SP)';
    }
    
    if (!estado.paisId) {
      errors.paisId = 'É necessário selecionar um país';
    }
    
    // Se há erros, exibe e para a execução
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Formatando os dados para corresponder ao modelo esperado pelo backend
    const estadoFormatado = {
      nome: estado.nome.trim(),
      uf: estado.uf.trim(),
      paisId: estado.paisId,
      ativo: estado.ativo
    };

    console.log('Dados enviados:', estadoFormatado);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/estados/${id}` : 'http://localhost:8080/estados';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estadoFormatado),
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
        navigate('/estados');
      })
      .catch((error) => {
        console.error('Erro ao salvar estado:', error);
        setErrorMessage('Erro ao salvar estado. Tente novamente.');
      });
  };

  const handleCancel = () => {
    navigate('/estados');
  };

  const handleOpenPaisModal = () => {
    setIsPaisModalOpen(true);
  };

  const handleClosePaisModal = () => {
    setIsPaisModalOpen(false);
  };

  const handlePaisSelecionado = (pais) => {
    setEstado({ ...estado, paisId: pais.id, paisNome: pais.nome });
    
    // Limpa o erro do campo país se existir
    if (fieldErrors.paisId) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.paisId;
        return newErrors;
      });
    }
    
    setIsPaisModalOpen(false);
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
            {id ? 'Editar Estado' : 'Cadastrar Novo Estado'}
          </Typography>

          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={estado.ativo}
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

        {/* Linha 1: Código e Nome do Estado */}
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

          <Grid item sx={{ width: '55%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nome do Estado"
              name="nome"
              value={estado.nome}
              onChange={handleChange}
              placeholder="Nome do estado"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>

          <Grid item sx={{ width: '8%', minWidth: 120 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="UF"
              name="uf"
              value={estado.uf}
              onChange={handleChange}
              placeholder="Ex: SP"
              variant="outlined"
              error={!!fieldErrors.uf}
              helperText={fieldErrors.uf || ''}
              inputProps={{ maxLength: 2 }}
            />
          </Grid>
        </Grid>

        {/* Linha 2: UF e País */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          

          <Grid item sx={{ width: '45%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="País"
                value={estado.paisNome}
                InputProps={{ readOnly: true }}
                variant="outlined"
                error={!!fieldErrors.paisId}
                helperText={fieldErrors.paisId || ''}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa'
                  }
                }}
                onClick={handleOpenPaisModal}
              />
              <IconButton
                onClick={handleOpenPaisModal}
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
            {estado.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(estado.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {estado.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(estado.ultimaModificacao).toLocaleString('pt-BR')}
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

      {/* Modal de seleção de países */}
      {isPaisModalOpen && (
        <PaisModal
          onClose={handleClosePaisModal}
          onPaisSelecionado={handlePaisSelecionado}
        />
      )}
    </Box>
  );
};

export default EstadoFormMUI;
