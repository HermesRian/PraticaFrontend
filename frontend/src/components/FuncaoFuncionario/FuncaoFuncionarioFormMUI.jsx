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
  Paper,
  Alert,
  InputAdornment,
  Stack
} from '@mui/material';

const FuncaoFuncionarioFormMUI = () => {
  const [funcaoFuncionario, setFuncaoFuncionario] = useState({
    nome: '',
    descricao: '',
    cargaHoraria: '',
    requerCnh: false,
    ativo: true,
    observacao: '',
    dataCadastro: '',
    ultimaModificacao: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/funcoes-funcionario/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const funcaoAtualizada = {
            ...data,
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || '',
            ativo: data.ativo !== null && data.ativo !== undefined ? data.ativo : true,
            requerCnh: data.requerCnh !== null && data.requerCnh !== undefined ? data.requerCnh : false,
          };
          
          setFuncaoFuncionario(funcaoAtualizada);
        })
        .catch((error) => console.error('Erro ao buscar cargo:', error));
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
    
    setFuncaoFuncionario({ ...funcaoFuncionario, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    
    const errors = {};
    
    if (!funcaoFuncionario.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!funcaoFuncionario.descricao?.trim()) {
      errors.descricao = 'Este campo é obrigatório';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const funcaoFormatada = {
      ...funcaoFuncionario,
      cargaHoraria: funcaoFuncionario.cargaHoraria ? parseFloat(funcaoFuncionario.cargaHoraria) : null,
    };

    console.log('Dados enviados:', funcaoFormatada);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/funcoes-funcionario/${id}` : 'http://localhost:8080/funcoes-funcionario';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(funcaoFormatada),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            try {
              const errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar cargo';
            } catch (e) {
              error = text || 'Erro ao salvar cargo';
            }
            throw new Error(error);
          });
        }
        return response.json();
      })
      .then(() => {
        navigate('/funcoes-funcionario');
      })
      .catch((error) => {
        console.error('Erro capturado:', error);
        setErrorMessage(error.message);
      });
  };

  const handleCancel = () => {
    navigate('/funcoes-funcionario');
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
          width: '95%',
          maxWidth: 1200,
          minHeight: '70vh',
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
        {/* Cabeçalho */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box sx={{ width: 120 }}></Box>
          
          {/* Título  */}
          <Typography 
            variant="h5" 
            component="h1" 
            align="center" 
            sx={{ color: '#333', fontWeight: 600, flex: 1 }}
          >
            {id ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}
          </Typography>
          
          {/* Switch */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={funcaoFuncionario.ativo}
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

        {/* Linha 1*/}
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

          <Grid item sx={{ width: '35%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Cargo"
              name="nome"
              value={funcaoFuncionario.nome}
              onChange={handleChange}
              placeholder="Nome do cargo"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label="Carga Horária"
              name="cargaHoraria"
              type="number"
              value={funcaoFuncionario.cargaHoraria}
              onChange={handleChange}
              placeholder="0,00"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">horas</InputAdornment>
              }}
              inputProps={{
                step: "0.01",
                min: "0"
              }}
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={funcaoFuncionario.requerCnh}
                  onChange={handleChange}
                  name="requerCnh"
                  color="primary"
                />
              }
              label="Requer CNH"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Descrição"
              name="descricao"
              value={funcaoFuncionario.descricao}
              onChange={handleChange}
              placeholder="Descrição do cargo"
              variant="outlined"
              error={!!fieldErrors.descricao}
              helperText={fieldErrors.descricao || ''}
            />
          </Grid>
        </Grid>

        {/* Linha 3*/}
          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Observações"
              name="observacao"
              value={funcaoFuncionario.observacao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o cargo"
              variant="outlined"
            />
          </Grid>
        {/* erro */}
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
          {/* registro */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {funcaoFuncionario.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(funcaoFuncionario.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {funcaoFuncionario.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(funcaoFuncionario.ultimaModificacao).toLocaleString('pt-BR')}
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
export default FuncaoFuncionarioFormMUI;
