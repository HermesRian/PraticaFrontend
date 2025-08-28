import React, { useState } from 'react';
import EstadoModal from '../Estado/EstadoModal'; // Modal de seleção de estados
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Tooltip,
  Box
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const CidadeFormModal = ({ onClose }) => {
  const [cidade, setCidade] = useState({
    nome: '',
    codigoIbge: '',
    estadoId: '',
    estadoNome: '', // Nome do estado selecionado
  });

  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpa o erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setCidade({ ...cidade, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!cidade.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!cidade.codigoIbge?.trim()) {
      errors.codigoIbge = 'Este campo é obrigatório';
    }
    
    if (!cidade.estadoId) {
      errors.estado = 'Selecione um estado';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validação
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowRequiredErrors(true);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const payload = {
      nome: cidade.nome,
      codigoIbge: cidade.codigoIbge,
      estadoId: parseInt(cidade.estadoId, 10)
    };

    fetch('http://localhost:8080/cidades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Erro ao cadastrar cidade');
          });
        }
        onClose(); // Fechar o modal após o cadastro
      })
      .catch((error) => {
        console.error('Erro ao cadastrar cidade:', error);
        setErrorMessage(error.message || 'Erro ao cadastrar cidade');
      });
  };
  const handleOpenEstadoModal = () => {
    setIsEstadoModalOpen(true);
  };

  const handleCloseEstadoModal = () => {
    setIsEstadoModalOpen(false);
  };

  const handleEstadoSelecionado = (estado) => {
    // Limpa o erro do estado quando um estado for selecionado
    if (fieldErrors.estado) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.estado;
        return newErrors;
      });
    }
    
    setCidade({ 
      ...cidade, 
      estadoId: estado.id, 
      estadoNome: estado.nome,
      estadoPaisNome: estado.paisNome 
    });
    setIsEstadoModalOpen(false);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >      <DialogTitle sx={{ 
        bgcolor: '#ffffff', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Paper 
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{ 
            p: 0,
            bgcolor: 'transparent'
          }}
        >
          {/* Cabeçalho com ícone */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',          mb: 4 
          }}>
            <Typography 
              variant="h5" 
              component="h1" 
              align="center" 
              sx={{ color: '#333', fontWeight: 600, flex: 1 }}
            >
              Cadastrar Nova Cidade
            </Typography>
          </Box>

          {/* Campos do formulário */}
          <Grid container spacing={3}>
            {/* Linha 1: Nome da Cidade */}
            <Grid item sx={{'width': '50%'}}>
              <TextField
                fullWidth
                size="small"
                label="Nome da Cidade"
                name="nome"
                value={cidade.nome}
                onChange={handleChange}
                required
                error={!!(showRequiredErrors && fieldErrors.nome)}
                helperText={showRequiredErrors && fieldErrors.nome}
                variant="outlined"
                placeholder="Digite o nome da cidade"
              />
            </Grid>

            {/* Linha 2: Código IBGE */}
            <Grid item sx={{'width': '30%'}}>
              <TextField
                fullWidth
                size="small"
                label="Código IBGE"
                name="codigoIbge"
                value={cidade.codigoIbge}
                onChange={handleChange}
                required
                error={!!(showRequiredErrors && fieldErrors.codigoIbge)}
                helperText={showRequiredErrors && fieldErrors.codigoIbge}
                variant="outlined"
                placeholder="Digite o código IBGE"
              />
            </Grid>

            {/* Linha 3: Estado */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Estado"
                value={cidade.estadoNome || ''}
                disabled
                required
                error={!!(showRequiredErrors && fieldErrors.estado)}
                helperText={showRequiredErrors && fieldErrors.estado}
                variant="outlined"
                placeholder="Selecione um estado"
                sx={{
                  backgroundColor: '#f8f9fa',
                  '& .MuiInputBase-input': {
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Buscar estado">
                      <IconButton 
                        onClick={handleOpenEstadoModal}
                        size="small"
                        color="primary"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>

          {/* Mensagem de erro */}
          {errorMessage && (
            <Alert 
              severity="error" 
              variant="filled"
              onClose={() => setErrorMessage('')}
              sx={{ mt: 3 }}
            >
              {errorMessage}
            </Alert>
          )}
        </Paper>
      </DialogContent>      <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Salvar
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancelar        </Button>
      </DialogActions>

      {/* Modal de seleção de estados */}
      {isEstadoModalOpen && (
        <EstadoModal
          onClose={handleCloseEstadoModal}
          onEstadoSelecionado={handleEstadoSelecionado}
        />
      )}
    </Dialog>
  );
};

export default CidadeFormModal;