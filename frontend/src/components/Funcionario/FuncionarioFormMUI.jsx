import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CidadeModal from '../Cidade/CidadeModal';
import CargoModal from '../Cargo/CargoModal';
import { 
  validarCPF, 
  formatCPF, 
  formatCEP, 
  formatTelefone, 
  formatRG 
} from '../../utils/documentValidation';

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
  Stack,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const FuncionarioFormMUI = () => {
  const [funcionario, setFuncionario] = useState({
    nome: '',
    cpfCnpj: '',
    funcaoFuncionarioId: '',
    cargoNome: '',
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
    apelido: '',
    rgInscricaoEstadual: '',
    cnh: '',
    dataValidadeCnh: '',
    sexo: 0,
    estadoCivil: 0,
    isBrasileiro: 1,
    nacionalidade: 0,
    dataNascimento: '',
    observacao: '',
    dataCriacao: '',
    dataAlteracao: ''
  });

  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/funcionarios/${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          console.log('Dados recebidos do backend:', data);
          
          let cidadeNome = '';
          if (data.cidadeId) {
            try {
              const cidadeResponse = await fetch(`http://localhost:8080/cidades/${data.cidadeId}`);
              if (cidadeResponse.ok) {
                const cidadeData = await cidadeResponse.json();
                cidadeNome = cidadeData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar cidade:', error);
            }
          }

          let cargoNome = '';
          if (data.funcaoFuncionarioId) {
            try {
              const cargoResponse = await fetch(`http://localhost:8080/funcoes-funcionario/${data.funcaoFuncionarioId}`);
              if (cargoResponse.ok) {
                const cargoData = await cargoResponse.json();
                cargoNome = cargoData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar cargo:', error);
            }
          }
          
          const funcionarioAtualizado = {
            ...data,
            cidadeNome: cidadeNome,
            cargoNome: cargoNome,
            dataAdmissao: data.dataAdmissao ? data.dataAdmissao.split('T')[0] : '',
            dataDemissao: data.dataDemissao ? data.dataDemissao.split('T')[0] : '',
            dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
            dataValidadeCnh: data.dataValidadeCnh ? data.dataValidadeCnh.split('T')[0] : '',
            dataCriacao: data.dataCriacao || '',
            dataAlteracao: data.dataAlteracao || '',
            sexo: data.sexo !== null && data.sexo !== undefined ? data.sexo : 0,
            estadoCivil: data.estadoCivil !== null && data.estadoCivil !== undefined ? data.estadoCivil : 0,
            isBrasileiro: data.isBrasileiro !== null && data.isBrasileiro !== undefined ? data.isBrasileiro : 1,
            nacionalidade: data.nacionalidade !== null && data.nacionalidade !== undefined ? data.nacionalidade : 0,
          };
          
          setFuncionario(funcionarioAtualizado);
        })
        .catch((error) => console.error('Erro ao buscar funcionário:', error));
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
    
    setFuncionario({ ...funcionario, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNumericChange = (e, maxLength) => {
    const { name } = e.target;
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFuncionario({ ...funcionario, [name]: value });
  };

  const getDisplayValue = (fieldName, value) => {
    if (!value) return '';
    
    switch (fieldName) {
      case 'telefone':
        return formatTelefone(value);
      case 'cep':
        return formatCEP(value);
      case 'cpfCnpj':
        return formatCPF(value);
      case 'rgInscricaoEstadual':
        return formatRG(value);
      default:
        return value;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    
    const errors = {};
    
    if (!funcionario.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!funcionario.cpfCnpj?.trim()) {
      errors.cpfCnpj = 'Este campo é obrigatório';
    } else if (!validarCPF(funcionario.cpfCnpj)) {
      errors.cpfCnpj = 'CPF inválido';
    }
    
    if (!funcionario.funcaoFuncionarioId) {
      errors.cargo = 'Selecione um cargo';
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
      errors.cidade = 'Selecione uma cidade';
    }
    
    if (!funcionario.dataAdmissao?.trim()) {
      errors.dataAdmissao = 'Este campo é obrigatório';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const funcionarioFormatado = {
      ...funcionario,
      salario: funcionario.salario ? parseFloat(funcionario.salario) : null,
      dataNascimento: funcionario.dataNascimento || null,
      dataDemissao: funcionario.dataDemissao || null,
      dataValidadeCnh: funcionario.dataValidadeCnh || null,
    };

    console.log('Dados enviados:', funcionarioFormatado);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/funcionarios/${id}` : 'http://localhost:8080/funcionarios';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(funcionarioFormatado),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            try {
              const errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar funcionário';
            } catch {
              error = text || 'Erro ao salvar funcionário';
            }
            throw new Error(error);
          });
        }
        return response.json();
      })
      .then(() => {
        navigate('/funcionarios');
      })
      .catch((error) => {
        console.error('Erro capturado:', error);
        setErrorMessage(error.message);
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

  const handleOpenCargoModal = () => {
    setIsCargoModalOpen(true);
  };

  const handleCloseCargoModal = () => {
    setIsCargoModalOpen(false);
  };

  const handleCidadeSelecionada = (cidade) => {
    if (fieldErrors.cidade) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cidade;
        return newErrors;
      });
    }
    
    setFuncionario({
      ...funcionario,
      cidadeId: cidade.id,
      cidadeNome: cidade.nome,
    });
    setIsCidadeModalOpen(false);
  };

  const handleCargoSelecionado = (cargo) => {
    if (fieldErrors.cargo) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cargo;
        return newErrors;
      });
    }
    
    setFuncionario({
      ...funcionario,
      funcaoFuncionarioId: cargo.id,
      cargoNome: cargo.nome,
    });
    setIsCargoModalOpen(false);
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
          maxWidth: 1390,
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
            {id ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
          </Typography>
          
          {/* Switch Ativo à direita */}
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={funcionario.ativo}
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

        {/* Linha 1: Código, Nome, Apelido, Cargo */}
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

          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              size="small"
              label="Apelido"
              name="apelido"
              value={funcionario.apelido}
              onChange={handleChange}
              placeholder="Apelido do funcionário"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '25%' }}>
            <FormControl fullWidth variant="outlined" size="small" error={!!fieldErrors.cargo}>
              <TextField
                id="cargo-input"
                value={funcionario.cargoNome || ''}
                label="Cargo"
                disabled
                fullWidth
                size="small"
                sx={{
                  backgroundColor: '#f8f9fa',
                  '& .MuiInputBase-input': {
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }
                }}
                InputLabelProps={{ 
                  shrink: true
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Buscar cargo">
                      <IconButton 
                        onClick={handleOpenCargoModal}
                        size="small"
                        color="primary"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
                error={!!fieldErrors.cargo}
                helperText={fieldErrors.cargo || ''}
              />
            </FormControl>
          </Grid>
        </Grid>

        {/* Linha 2: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '25%' }}>
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

          <Grid item sx={{ width: '8%', minWidth: 80 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Número"
              name="numero"
              value={funcionario.numero}
              onChange={(e) => handleNumericChange(e)}
              placeholder="Nº"
              variant="outlined"
              inputProps={{ inputMode: 'numeric' }}
              error={!!fieldErrors.numero}
              helperText={fieldErrors.numero || ''}
            />
          </Grid>
          
          <Grid item sx={{ width: '13%' }}>
            <TextField
              fullWidth
              size="small"
              label="Complemento"
              name="complemento"
              value={funcionario.complemento}
              onChange={handleChange}
              placeholder="Apto, Bloco, Casa"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '13%', minWidth: 120 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Bairro"
              name="bairro"
              value={funcionario.bairro}
              onChange={handleChange}
              placeholder="Bairro"
              variant="outlined"
              error={!!fieldErrors.bairro}
              helperText={fieldErrors.bairro || ''}
            />
          </Grid>

          <Grid item sx={{ width: '10%', minWidth: 100 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="CEP"
              name="cep"
              value={getDisplayValue('cep', funcionario.cep)}
              onChange={e => handleNumericChange(e, 8)}
              variant="outlined"
              error={!!fieldErrors.cep || (funcionario.cep && funcionario.cep.length !== 8)}
              helperText={fieldErrors.cep || (funcionario.cep && funcionario.cep.length !== 8 ? 'CEP inválido' : '')}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <FormControl fullWidth variant="outlined" size="small" error={!!fieldErrors.cidade}>
              <TextField
                id="cidade-input"
                value={funcionario.cidadeNome || ''}
                label="Cidade"
                disabled
                fullWidth
                size="small"
                sx={{
                  backgroundColor: '#f8f9fa',
                  '& .MuiInputBase-input': {
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }
                }}
                InputLabelProps={{ 
                  shrink: true
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Buscar cidade">
                      <IconButton 
                        onClick={handleOpenCidadeModal}
                        size="small"
                        color="primary"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
                error={!!fieldErrors.cidade}
                helperText={fieldErrors.cidade || ''}
              />
            </FormControl>
          </Grid>
        </Grid>

        {/* Linha 3: Telefone, Email, Data de Nascimento, Sexo, Estado Civil */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Telefone"
              name="telefone"
              value={getDisplayValue('telefone', funcionario.telefone)}
              onChange={e => handleNumericChange(e, 11)}
              variant="outlined"
              error={!!fieldErrors.telefone || (funcionario.telefone && (funcionario.telefone.length < 10 || funcionario.telefone.length > 11))}
              helperText={fieldErrors.telefone || (funcionario.telefone && (funcionario.telefone.length < 10 || funcionario.telefone.length > 11) ? 'Telefone inválido (10 ou 11 dígitos)' : '')}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              required
              type="email"
              size="small"
              label="Email"
              name="email"
              value={funcionario.email}
              onChange={handleChange}
              placeholder="exemplo@email.com"
              variant="outlined"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ''}
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label="Data de Nascimento"
              name="dataNascimento"
              type="date"
              value={funcionario.dataNascimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '15%', minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sexo</InputLabel>
              <Select
                name="sexo"
                value={funcionario.sexo}
                onChange={handleChange}
                label="Sexo"
              >
                <MenuItem value={0}>Masculino</MenuItem>
                <MenuItem value={1}>Feminino</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item sx={{ width: '15%' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado Civil</InputLabel>
              <Select
                name="estadoCivil"
                value={funcionario.estadoCivil}
                onChange={handleChange}
                label="Estado Civil"
              >
                <MenuItem value={0}>Solteiro(a)</MenuItem>
                <MenuItem value={1}>Casado(a)</MenuItem>
                <MenuItem value={2}>Divorciado(a)</MenuItem>
                <MenuItem value={3}>Viúvo(a)</MenuItem>
                <MenuItem value={4}>União Estável</MenuItem>
                <MenuItem value={5}>Separado(a)</MenuItem>
                <MenuItem value={6}>Outro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Linha 4: CPF, RG, CNH, Validade CNH */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="CPF"
              name="cpfCnpj"
              value={getDisplayValue('cpfCnpj', funcionario.cpfCnpj)}
              onChange={e => handleNumericChange(e, 11)}
              variant="outlined"
              error={!!fieldErrors.cpfCnpj}
              helperText={fieldErrors.cpfCnpj || ''}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label="RG"
              name="rgInscricaoEstadual"
              value={getDisplayValue('rgInscricaoEstadual', funcionario.rgInscricaoEstadual)}
              onChange={handleChange}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid item sx={{ width: '20%' }}>
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

          <Grid item sx={{ width: '20%' }}>
            <TextField
              fullWidth
              size="small"
              label="Validade CNH"
              name="dataValidadeCnh"
              type="date"
              value={funcionario.dataValidadeCnh}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
        </Grid>

        {/* Linha 5: Data de Admissão, Salário, Data de Demissão */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Data de Admissão"
              name="dataAdmissao"
              type="date"
              value={funcionario.dataAdmissao}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              error={!!fieldErrors.dataAdmissao}
              helperText={fieldErrors.dataAdmissao || ''}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '20%' }}>
            <TextField
              fullWidth
              size="small"
              label="Salário"
              name="salario"
              type="number"
              value={funcionario.salario}
              onChange={handleChange}
              placeholder="0,00"
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>
              }}
              inputProps={{
                step: "0.01",
                min: "0"
              }}
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label="Data de Demissão"
              name="dataDemissao"
              type="date"
              value={funcionario.dataDemissao}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
        </Grid>

        {/* Linha 7: Observação */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Observações"
              name="observacao"
              value={funcionario.observacao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o funcionário"
              variant="outlined"
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
            {funcionario.dataCriacao && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(funcionario.dataCriacao).toLocaleString('pt-BR')}
              </Typography>
            )}
            {funcionario.dataAlteracao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(funcionario.dataAlteracao).toLocaleString('pt-BR')}
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

      {/* Modal de seleção de cidades */}
      {isCidadeModalOpen && (
        <CidadeModal
          onClose={handleCloseCidadeModal}
          onCidadeSelecionada={handleCidadeSelecionada}
        />
      )}

      {/* Modal de seleção de cargos */}
      {isCargoModalOpen && (
        <CargoModal
          onClose={handleCloseCargoModal}
          onCargoSelecionado={handleCargoSelecionado}
        />
      )}
    </Box>
  );
};
export default FuncionarioFormMUI;
