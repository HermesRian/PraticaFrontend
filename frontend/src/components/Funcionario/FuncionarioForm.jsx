import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CidadeModal from '../Cidade/CidadeModal';
import { 
  validarCPF, 
  formatCPF, 
  formatCEP, 
  formatTelefone 
} from '../../utils/documentValidation';

// Importações do Material-UI
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Stack,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const FuncionarioForm = () => {
  const [funcionario, setFuncionario] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    salario: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    cidadeNome: '',
    ativo: true,
    dataAdmissao: '',
    dataDemissao: '',
    cnh: '',
    categoriaCnh: '',
    rg: '',
    pis: '',
    contaBanco: '',
    agencia: '',
    banco: '',
    observacao: '',
    dataCadastro: '',
    ultimaModificacao: ''
  });

  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/funcionarios/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setFuncionario({
            ...data,
            cidadeNome: data.cidadeNome || '',
            ativo: data.ativo !== undefined ? data.ativo : true,
            // Formatar datas para o padrão do HTML input date
            dataAdmissao: data.dataAdmissao ? data.dataAdmissao.split('T')[0] : '',
            dataDemissao: data.dataDemissao ? data.dataDemissao.split('T')[0] : '',
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || ''
          });
        })
        .catch((error) => console.error('Erro ao buscar funcionário:', error));
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
    
    setFuncionario({ ...funcionario, [name]: type === 'checkbox' ? checked : value });
  };

  // Função específica para campos numéricos com máscara
  const handleNumericChange = (e, maxLength, maskFunction) => {
    const { name } = e.target;
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    // Limpa o erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFuncionario({ ...funcionario, [name]: value });
  };

  // Função para obter valor formatado para exibição
  const getDisplayValue = (fieldName, value) => {
    if (!value) return '';
    
    switch (fieldName) {
      case 'telefone':
        return formatTelefone(value);
      case 'cep':
        return formatCEP(value);
      case 'cpf':
        return formatCPF(value);
      default:
        return value;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpa erros anteriores
    setFieldErrors({});
    setErrorMessage('');
    
    // Validação de campos obrigatórios
    const errors = {};
    
    if (!funcionario.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!funcionario.cpf?.trim()) {
      errors.cpf = 'Este campo é obrigatório';
    } else if (!validarCPF(funcionario.cpf)) {
      errors.cpf = 'CPF inválido';
    }
    
    if (!funcionario.cargo?.trim()) {
      errors.cargo = 'Este campo é obrigatório';
    }
    
    if (!funcionario.salario?.toString().trim()) {
      errors.salario = 'Este campo é obrigatório';
    }
    
    if (!funcionario.email?.trim()) {
      errors.email = 'Este campo é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(funcionario.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!funcionario.telefone?.trim()) {
      errors.telefone = 'Este campo é obrigatório';
    }
    
    if (!funcionario.endereco?.trim()) {
      errors.endereco = 'Este campo é obrigatório';
    }
    
    if (!funcionario.numero?.trim()) {
      errors.numero = 'Este campo é obrigatório';
    }
    
    if (!funcionario.bairro?.trim()) {
      errors.bairro = 'Este campo é obrigatório';
    }
    
    if (!funcionario.cep?.trim()) {
      errors.cep = 'Este campo é obrigatório';
    }
    
    if (!funcionario.cidadeId) {
      errors.cidadeId = 'Selecione uma cidade';
    }
    
    if (!funcionario.dataAdmissao?.trim()) {
      errors.dataAdmissao = 'Este campo é obrigatório';
    }
    
    // Se houver erros, não submete o formulário
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, corrija os erros destacados nos campos acima.');
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/funcionarios/${id}` : 'http://localhost:8080/funcionarios';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(funcionario),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao salvar funcionário');
        }
        return response.json();
      })
      .then(() => {
        navigate('/funcionarios');
      })
      .catch((error) => {
        console.error('Erro ao salvar funcionário:', error);
        setErrorMessage('Erro ao salvar funcionário. Tente novamente.');
      });
  };

  const handleCancel = () => {
    navigate('/funcionarios');
  };

  const handleOpenCidadeModal = () => {
    setIsCidadeModalOpen(true);
  };

  const handleCloseCidadeModal = () => {
    setIsCidadeModalOpen(false);
  };

  const handleCidadeSelecionada = (cidade) => {
    setFuncionario({ 
      ...funcionario, 
      cidadeId: cidade.id, 
      cidadeNome: cidade.nome 
    });
    setIsCidadeModalOpen(false);
    
    // Limpa erro da cidade se existir
    if (fieldErrors.cidadeId) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cidadeId;
        return newErrors;
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: 'primary.main',
            fontWeight: 'bold'
          }}
        >
          {id ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Linha 1: Nome, CPF, Cargo, Salário */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                label="Funcionário"
                name="nome"
                value={funcionario.nome}
                onChange={handleChange}
                placeholder="Nome do funcionário"
                variant="outlined"
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome || ''}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="CPF"
                name="cpf"
                value={getDisplayValue('cpf', funcionario.cpf)}
                onChange={(e) => handleNumericChange(e, 11)}
                placeholder="000.000.000-00"
                variant="outlined"
                inputProps={{ inputMode: 'numeric' }}
                error={!!fieldErrors.cpf}
                helperText={fieldErrors.cpf || ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                size="small"
                label="Cargo"
                name="cargo"
                value={funcionario.cargo}
                onChange={handleChange}
                placeholder="Cargo do funcionário"
                variant="outlined"
                error={!!fieldErrors.cargo}
                helperText={fieldErrors.cargo || ''}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="Salário"
                name="salario"
                type="number"
                value={funcionario.salario}
                onChange={handleChange}
                placeholder="0,00"
                variant="outlined"
                inputProps={{ 
                  min: 0, 
                  step: "0.01",
                  inputMode: 'decimal' 
                }}
                error={!!fieldErrors.salario}
                helperText={fieldErrors.salario || ''}
              />
            </Grid>
          </Grid>

          {/* Linha 2: Email, Telefone, RG, PIS */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                label="Email"
                name="email"
                type="email"
                value={funcionario.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                variant="outlined"
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || ''}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="Telefone"
                name="telefone"
                value={getDisplayValue('telefone', funcionario.telefone)}
                onChange={(e) => handleNumericChange(e, 11)}
                placeholder="(00) 00000-0000"
                variant="outlined"
                inputProps={{ inputMode: 'numeric' }}
                error={!!fieldErrors.telefone}
                helperText={fieldErrors.telefone || ''}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="RG"
                name="rg"
                value={funcionario.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="PIS"
                name="pis"
                value={funcionario.pis}
                onChange={(e) => handleNumericChange(e, 11)}
                placeholder="000.00000.00-0"
                variant="outlined"
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
          </Grid>

          {/* Linha 3: Endereço, Número, Complemento, Bairro */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                label="Endereço"
                name="endereco"
                value={funcionario.endereco}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
                variant="outlined"
                error={!!fieldErrors.endereco}
                helperText={fieldErrors.endereco || ''}
              />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="Número"
                name="numero"
                value={funcionario.numero}
                onChange={handleChange}
                placeholder="Nº"
                variant="outlined"
                error={!!fieldErrors.numero}
                helperText={fieldErrors.numero || ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Complemento"
                name="complemento"
                value={funcionario.complemento}
                onChange={handleChange}
                placeholder="Apto, Casa, Bloco"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="Bairro"
                name="bairro"
                value={funcionario.bairro}
                onChange={handleChange}
                placeholder="Nome do bairro"
                variant="outlined"
                error={!!fieldErrors.bairro}
                helperText={fieldErrors.bairro || ''}
              />
            </Grid>
          </Grid>

          {/* Linha 4: CEP, Cidade */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="CEP"
                name="cep"
                value={getDisplayValue('cep', funcionario.cep)}
                onChange={(e) => handleNumericChange(e, 8)}
                placeholder="00000-000"
                variant="outlined"
                inputProps={{ inputMode: 'numeric' }}
                error={!!fieldErrors.cep}
                helperText={fieldErrors.cep || ''}
              />
            </Grid>
            <Grid item xs={12} md={9.5}>
              <TextField
                fullWidth
                required
                size="small"
                label="Cidade"
                name="cidadeNome"
                value={funcionario.cidadeNome || 'Selecione uma cidade'}
                disabled
                variant="outlined"
                error={!!fieldErrors.cidadeId}
                helperText={fieldErrors.cidadeId || ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Selecionar cidade">
                        <IconButton
                          onClick={handleOpenCidadeModal}
                          edge="end"
                          size="small"
                        >
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Linha 5: Datas de Admissão e Demissão */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                size="small"
                label="Data de Admissão"
                name="dataAdmissao"
                type="date"
                value={funcionario.dataAdmissao}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.dataAdmissao}
                helperText={fieldErrors.dataAdmissao || ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Data de Demissão"
                name="dataDemissao"
                type="date"
                value={funcionario.dataDemissao}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Linha 6: CNH, Categoria CNH */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="CNH"
                name="cnh"
                value={funcionario.cnh}
                onChange={(e) => handleNumericChange(e, 11)}
                placeholder="00000000000"
                variant="outlined"
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria CNH</InputLabel>
                <Select
                  name="categoriaCnh"
                  value={funcionario.categoriaCnh}
                  onChange={handleChange}
                  label="Categoria CNH"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                  <MenuItem value="E">E</MenuItem>
                  <MenuItem value="AB">AB</MenuItem>
                  <MenuItem value="AC">AC</MenuItem>
                  <MenuItem value="AD">AD</MenuItem>
                  <MenuItem value="AE">AE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Linha 7: Dados Bancários */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Banco"
                name="banco"
                value={funcionario.banco}
                onChange={handleChange}
                placeholder="Nome do banco"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Agência"
                name="agencia"
                value={funcionario.agencia}
                onChange={handleChange}
                placeholder="0000"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Conta"
                name="contaBanco"
                value={funcionario.contaBanco}
                onChange={handleChange}
                placeholder="00000-0"
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* Linha 8: Observação */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Observação"
                name="observacao"
                value={funcionario.observacao}
                onChange={handleChange}
                placeholder="Observações gerais sobre o funcionário"
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          {/* Switch de Status Ativo */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={funcionario.ativo}
                  onChange={handleChange}
                  name="ativo"
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {funcionario.ativo ? 'Funcionário Ativo' : 'Funcionário Inativo'}
                </Typography>
              }
            />
          </Box>

          {/* Mensagem de erro */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
              {funcionario.dataCadastro && (
                <Typography variant="caption" color="text.secondary">
                  Data de cadastro: {new Date(funcionario.dataCadastro).toLocaleString('pt-BR')}
                </Typography>
              )}
              {funcionario.ultimaModificacao && (
                <Typography variant="caption" color="text.secondary">
                  Última modificação: {new Date(funcionario.ultimaModificacao).toLocaleString('pt-BR')}
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
        </Box>
      </Paper>

      {/* Modal de seleção de cidades */}
      {isCidadeModalOpen && (
        <CidadeModal
          onClose={handleCloseCidadeModal}
          onCidadeSelecionada={handleCidadeSelecionada}
        />
      )}
    </Container>
  );
};
export default FuncionarioForm;