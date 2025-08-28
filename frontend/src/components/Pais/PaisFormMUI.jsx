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

// Componente de formulário de país
const PaisFormMUI = () => {
  const [pais, setPais] = useState({
    nome: '',
    sigla: '',
    codigo: '',
    ativo: true,
    dataCadastro: '',
    ultimaModificacao: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/paises/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const paisAtualizado = {
            nome: data.nome || '',
            sigla: data.sigla || '',
            codigo: data.codigo || '',
            ativo: true, // Sempre ativo até o backend ser corrigido
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('País final:', paisAtualizado);
          setPais(paisAtualizado);
        })
        .catch((error) => console.error('Erro ao buscar país:', error));
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
    
    // Converte sigla para maiúscula automaticamente
    let finalValue = name === 'sigla' ? value.toUpperCase() : value;
    
    // Garante que o DDI comece com +
    if (name === 'codigo') {
      if (value && !value.startsWith('+')) {
        finalValue = '+' + value.replace(/\+/g, ''); // Remove + existentes e adiciona apenas um no início
      }
    }
    
    setPais({ ...pais, [name]: type === 'checkbox' ? checked : finalValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!pais.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!pais.sigla?.trim()) {
      errors.sigla = 'Este campo é obrigatório';
    }
    
    if (!pais.codigo?.trim()) {
      errors.codigo = 'Este campo é obrigatório';
    } else if (!pais.codigo.startsWith('+') || pais.codigo.length < 2) {
      errors.codigo = 'DDI deve começar com + e ter pelo menos 1 dígito (ex: +55)';
    }
    
    // Se há erros, exibe e para a execução
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Formatando os dados para corresponder ao modelo esperado pelo backend
    const paisFormatado = {
      nome: pais.nome.trim(),
      sigla: pais.sigla.trim(),
      codigo: pais.codigo.trim(),
      ativo: true // Sempre ativo até o backend ser corrigido
    };

    console.log('Dados enviados:', paisFormatado);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/paises/${id}` : 'http://localhost:8080/paises';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paisFormatado),
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
        navigate('/paises');
      })
      .catch((error) => {
        console.error('Erro ao salvar país:', error);
        setErrorMessage('Erro ao salvar país. Tente novamente.');
      });
  };

  const handleCancel = () => {
    navigate('/paises');
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
            {id ? 'Editar País' : 'Cadastrar Novo País'}
          </Typography>

          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pais.ativo}
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

        {/* Linha 1: Código, Nome, Sigla */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
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

          <Grid item sx={{ width: '50%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nome do País"
              name="nome"
              value={pais.nome}
              onChange={handleChange}
              placeholder="Nome do país"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>

          <Grid item sx={{ width: '15%', minWidth: 120 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Sigla"
              name="sigla"
              value={pais.sigla}
              onChange={handleChange}
              placeholder="Ex: BR"
              variant="outlined"
              error={!!fieldErrors.sigla}
              helperText={fieldErrors.sigla || ''}
              inputProps={{ maxLength: 3 }}
            />
          </Grid>

          <Grid item sx={{ width: '15%', minWidth: 120 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="DDI"
              name="codigo"
              value={pais.codigo}
              onChange={handleChange}
              placeholder="Ex: +55"
              variant="outlined"
              error={!!fieldErrors.codigo}
              helperText={fieldErrors.codigo || ''}
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
            {pais.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(pais.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {pais.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(pais.ultimaModificacao).toLocaleString('pt-BR')}
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

export default PaisFormMUI;
