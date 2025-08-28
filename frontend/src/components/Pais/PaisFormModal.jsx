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
  Box
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';

const PaisFormModal = ({ open, onClose, onSuccess, pais = null }) => {
  const [formData, setFormData] = useState({
    nome: pais?.nome || '',
    sigla: pais?.sigla || '',
    codigo: pais?.codigo || '',
  });

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
    
    if (!formData.sigla?.trim()) {
      errors.sigla = 'Este campo é obrigatório';
    }
    
    if (!formData.codigo?.trim()) {
      errors.codigo = 'Este campo é obrigatório';
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

    try {
      const url = pais 
        ? `http://localhost:8080/paises/${pais.id}`
        : 'http://localhost:8080/paises';
      
      const method = pais ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Erro ao salvar país');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar país:', error);
      setErrorMessage(error.message || 'Erro ao salvar país');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              {pais ? 'Editar País' : 'Cadastrar Novo País'}
            </Typography>
          </Box>

          {/* Campos do formulário */}
          <Grid container spacing={3}>
            {/* Linha 1: Nome do País */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nome do País"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                error={!!(showRequiredErrors && fieldErrors.nome)}
                helperText={showRequiredErrors && fieldErrors.nome}
                variant="outlined"
                placeholder="Digite o nome do país"
              />
            </Grid>

            {/* Linha 2: Sigla e Código */}
            <Grid item sx={{width: '30%'}}>
              <TextField
                fullWidth
                size="small"
                label="Sigla"
                name="sigla"
                value={formData.sigla}
                onChange={handleChange}
                required
                error={!!(showRequiredErrors && fieldErrors.sigla)}
                helperText={showRequiredErrors && fieldErrors.sigla}
                variant="outlined"
                placeholder="Ex: BR"
                inputProps={{ maxLength: 3 }}
              />
            </Grid>

            <Grid item sx={{width: '50%'}}>
              <TextField
                fullWidth
                size="small"
                label="Código do País"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                error={!!(showRequiredErrors && fieldErrors.codigo)}
                helperText={showRequiredErrors && fieldErrors.codigo}
                variant="outlined"
                placeholder="Ex: 55"
                type="number"
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
  );
};

export default PaisFormModal;