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

// Componente de formulário de forma de pagamento
const FormaPagamentoForm = () => {
  const [formaPagamento, setFormaPagamento] = useState({
    descricao: '',
    ativo: true,
    dataCadastro: '',
    ultimaModificacao: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/formas-pagamento/${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Dados recebidos do backend:', data);
          
          const formaPagamentoAtualizada = {
            ...data,
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Forma de pagamento final:', formaPagamentoAtualizada);
          setFormaPagamento(formaPagamentoAtualizada);
        })
        .catch((error) => console.error('Erro ao buscar forma de pagamento:', error));
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
    
    setFormaPagamento({ ...formaPagamento, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!formaPagamento.descricao?.trim()) {
      errors.descricao = 'Este campo é obrigatório';
    }
    
    // Se há erros, exibe e para a execução
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowRequiredErrors(true);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Formatando os dados para corresponder ao modelo esperado pelo backend
    const formaPagamentoFormatada = {
      ...formaPagamento,
    };

    console.log('Dados enviados:', formaPagamentoFormatada);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/formas-pagamento/${id}` : 'http://localhost:8080/formas-pagamento';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formaPagamentoFormatada),
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
        navigate('/formas-pagamento');
      })
      .catch((error) => {
        console.error('Erro ao salvar forma de pagamento:', error);
        setErrorMessage('Erro ao salvar forma de pagamento. Tente novamente.');
      });
  };

  const handleCancel = () => {
    navigate('/formas-pagamento');
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
            {id ? 'Editar Forma de Pagamento' : 'Cadastrar Nova Forma de Pagamento'}
          </Typography>

          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formaPagamento.ativo}
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

        {/* Linha 1: Código, Descrição */}
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
              label="Descrição"
              name="descricao"
              value={formaPagamento.descricao}
              onChange={handleChange}
              placeholder="Descrição da forma de pagamento"
              variant="outlined"
              error={!!fieldErrors.descricao}
              helperText={fieldErrors.descricao || ''}
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
            {formaPagamento.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(formaPagamento.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {formaPagamento.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(formaPagamento.ultimaModificacao).toLocaleString('pt-BR')}
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

export default FormaPagamentoForm;
