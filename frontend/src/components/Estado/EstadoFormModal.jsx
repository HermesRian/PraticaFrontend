import React, { useState } from 'react';
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
import PaisModal from '../Pais/PaisModal';

const EstadoFormModal = ({ open, onClose, onSuccess, estado = null }) => {
  const [formData, setFormData] = useState({
    nome: estado?.nome || '',
    uf: estado?.uf || '',
    paisId: estado?.paisId || '',
    paisNome: estado?.paisNome || '',
  });

  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!formData.uf?.trim()) {
      errors.uf = 'Este campo é obrigatório';
    }
    
    if (!formData.paisId) {
      errors.pais = 'Selecione um país';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
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
    
    setLoading(true);

    const payload = {
      nome: formData.nome,
      uf: formData.uf,
      paisId: parseInt(formData.paisId, 10)
    };

    try {
      const url = estado 
        ? `http://localhost:8080/estados/${estado.id}`
        : 'http://localhost:8080/estados';
      
      const method = estado ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Erro ao salvar estado');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
      setErrorMessage(error.message || 'Erro ao salvar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaisModal = () => {
    setIsPaisModalOpen(true);
  };

  const handleClosePaisModal = () => {
    setIsPaisModalOpen(false);
  };

  const handlePaisSelecionado = (pais) => {
    // Limpa o erro do país quando um país for selecionado
    if (fieldErrors.pais) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pais;
        return newErrors;
      });
    }
    
    setFormData({ ...formData, paisId: pais.id, paisNome: pais.nome });
    setIsPaisModalOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
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
            {/* Cabeçalho */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mb: 4 
            }}>
              <Typography 
                variant="h5" 
                component="h1" 
                align="center" 
                sx={{ color: '#333', fontWeight: 600, flex: 1 }}
              >
                {estado ? 'Editar Estado' : 'Cadastrar Novo Estado'}
              </Typography>
            </Box>

            {/* Campos do formulário */}
            <Grid container spacing={3}>
              {/* Linha 1: Nome do Estado */}
              <Grid item sx={{width: '60%'}}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do Estado"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  error={!!(showRequiredErrors && fieldErrors.nome)}
                  helperText={showRequiredErrors && fieldErrors.nome}
                  variant="outlined"
                  placeholder="Digite o nome do estado"
                />
              </Grid>

              {/* Linha 2: UF */}
              <Grid item sx={{width: '20%'}}>
                <TextField
                  fullWidth
                  size="small"
                  label="UF"
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  required
                  error={!!(showRequiredErrors && fieldErrors.uf)}
                  helperText={showRequiredErrors && fieldErrors.uf}
                  variant="outlined"
                  placeholder="Ex: SP"
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>

              {/* Linha 3: País */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="País"
                  value={formData.paisNome || ''}
                  disabled
                  required
                  error={!!(showRequiredErrors && fieldErrors.pais)}
                  helperText={showRequiredErrors && fieldErrors.pais}
                  variant="outlined"
                  placeholder="Selecione um país"
                  sx={{
                    backgroundColor: '#f8f9fa',
                    '& .MuiInputBase-input': {
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Buscar país">
                        <IconButton 
                          onClick={handleOpenPaisModal}
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
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de seleção de países */}
      {isPaisModalOpen && (
        <PaisModal
          onClose={handleClosePaisModal}
          onPaisSelecionado={handlePaisSelecionado}
        />
      )}
    </>
  );
};

export default EstadoFormModal;