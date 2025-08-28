import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';

const CargoFormModal = ({ onClose }) => {
  const [cargo, setCargo] = useState({
    nome: '',
    descricao: '',
    cargaHoraria: '',
    requerCnh: false,
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setCargo({
      ...cargo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setFieldErrors({});

    const errors = {};
    if (!cargo.nome.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const cargoData = {
        ...cargo,
        cargaHoraria: cargo.cargaHoraria ? parseFloat(cargo.cargaHoraria) : null
      };

      const response = await fetch('http://localhost:8080/funcoes-funcionario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cargoData),
      });

      if (response.ok) {
        onClose();
      } else {
        const errorText = await response.text();
        setErrorMessage(`Erro ao salvar cargo: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      setErrorMessage('Erro ao salvar cargo. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
    >
      <DialogTitle sx={{ 
        bgcolor: '#ffffff', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          Cadastrar Novo Cargo
        </Typography>
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
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                size="small"
                label="Nome do Cargo"
                name="nome"
                value={cargo.nome}
                onChange={handleChange}
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome || ''}
                variant="outlined"
                placeholder="Digite o nome do cargo"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Carga Horária (horas)"
                name="cargaHoraria"
                type="number"
                value={cargo.cargaHoraria}
                onChange={handleChange}
                variant="outlined"
                placeholder="0"
                inputProps={{
                  step: "0.5",
                  min: "0"
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descrição"
                name="descricao"
                value={cargo.descricao}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                placeholder="Digite a descrição do cargo"
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cargo.requerCnh}
                    onChange={handleChange}
                    name="requerCnh"
                    color="primary"
                  />
                }
                label="Requer CNH"
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cargo.ativo}
                    onChange={handleChange}
                    name="ativo"
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
          </Grid>

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
          disabled={loading}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CargoFormModal;
