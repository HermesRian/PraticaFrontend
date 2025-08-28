import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CidadeModal from '../Cidade/CidadeModal';
import CondicaoPagamentoModal from '../CondicaoPagamento/CondicaoPagamentoModal';
import { 
  validarCPF, 
  validarCNPJ, 
  validarCpfCnpjEmTempoReal, 
  formatCPF, 
  formatCNPJ, 
  formatCEP, 
  formatTelefone, 
  formatRG, 
  formatIE 
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
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
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

const converterEstadoCivilParaNumero = (estadoCivil) => {
  switch (estadoCivil) {
    case 'SOLTEIRO': return 0;
    case 'CASADO': return 1;
    case 'DIVORCIADO': return 2;
    case 'VIUVO': return 3;
    case 'UNIAO_ESTAVEL': return 4;
    case 'SEPARADO': return 5;
    case 'OUTRO': return 6;
    default: return null;
  }
};

const converterNumeroParaEstadoCivil = (numero) => {
  if (numero === null || numero === undefined) return '';
  
  switch (Number(numero)) {
    case 0: return 'SOLTEIRO';
    case 1: return 'CASADO';
    case 2: return 'DIVORCIADO';
    case 3: return 'VIUVO';
    case 4: return 'UNIAO_ESTAVEL';
    case 5: return 'SEPARADO';
    case 6: return 'OUTRO';
    default: return '';
  }
};

const ClienteForm = ({ id: propId, isModal = false, onClose }) => {
  const [cliente, setCliente] = useState({
    nome: '',
    cnpjCpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    cidadeNome: '',
    cidadeEstado: '',
    cidadeEstadoPais: '',
    telefone: '',
    email: '',
    ativo: true,
    apelido: '',
    limiteCredito: '',
    limiteCredito2: '',
    nacionalidade: '',
    rgInscricaoEstadual: '',
    dataNascimento: '',
    estadoCivil: '',
    tipo: 'FISICA',
    sexo: '',
    condicaoPagamentoId: '',
    condicaoPagamentoDescricao: '',
    observacao: '',
    dataCadastro: '',
    ultimaModificacao: '',
  });
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [estados, setEstados] = useState([]);
  const [paises, setPaises] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/estados').then(res => res.json()),
      fetch('http://localhost:8080/paises').then(res => res.json())
    ])
    .then(([estadosData, paisesData]) => {
      setEstados(estadosData);
      setPaises(paisesData);
    })
    .catch(error => console.error('Erro ao carregar estados e países:', error));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/clientes/${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          console.log('Dados recebidos do backend:', data);
          console.log('cidadeId:', data.cidadeId, 'condicaoPagamentoId:', data.condicaoPagamentoId);
          
          const tipoFormatado = typeof data.tipo === 'number' 
            ? (data.tipo === 0 ? 'FISICA' : 'JURIDICA') 
            : (data.tipo || 'FISICA');
            
          const sexoFormatado = typeof data.sexo === 'number' 
            ? (data.sexo === 0 ? 'M' : data.sexo === 1 ? 'F' : 'O') 
            : (data.sexo || '');

          let cidadeNome = '';
          let cidadeEstado = '';
          let cidadeEstadoPais = '';
          if (data.cidadeId) {
            try {
              console.log('Buscando cidade com ID:', data.cidadeId);
              const cidadeResponse = await fetch(`http://localhost:8080/cidades/${data.cidadeId}`);
              if (cidadeResponse.ok) {
                const cidadeData = await cidadeResponse.json();
                cidadeNome = cidadeData.nome || '';
                
                if (cidadeData.estadoId) {
                  const estadoResponse = await fetch(`http://localhost:8080/estados/${cidadeData.estadoId}`);
                  if (estadoResponse.ok) {
                    const estadoData = await estadoResponse.json();
                    cidadeEstado = estadoData.nome || '';
                    
                    if (estadoData.paisId) {
                      const paisResponse = await fetch(`http://localhost:8080/paises/${estadoData.paisId}`);
                      if (paisResponse.ok) {
                        const paisData = await paisResponse.json();
                        cidadeEstadoPais = paisData.nome || '';
                      }
                    }
                  }
                }
                
                console.log('Dados da cidade:', cidadeData);
                console.log('Nome da cidade encontrado:', cidadeNome);
                console.log('Estado:', cidadeEstado);
                console.log('País:', cidadeEstadoPais);
              } else {
                console.error('Erro ao buscar cidade, status:', cidadeResponse.status);
              }
            } catch (error) {
              console.error('Erro ao buscar cidade:', error);
            }
          }

          let condicaoPagamentoDescricao = '';
          if (data.condicaoPagamentoId) {
            try {
              console.log('Buscando condição de pagamento com ID:', data.condicaoPagamentoId);
              let condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${data.condicaoPagamentoId}`);              
              if (condicaoResponse.ok) {
                const condicaoData = await condicaoResponse.json();
                condicaoPagamentoDescricao = condicaoData.descricao || '';
                console.log('Dados da condição de pagamento:', condicaoData);
                console.log('Descrição da condição encontrada:', condicaoPagamentoDescricao);
              } else {
                console.error('Erro ao buscar condição de pagamento, status:', condicaoResponse.status);
              }
            } catch (error) {
              console.error('Erro ao buscar condição de pagamento:', error);
            }
          }
            
          const clienteAtualizado = {
            ...data,
            cidadeNome: cidadeNome,
            cidadeEstado: cidadeEstado,
            cidadeEstadoPais: cidadeEstadoPais,
            condicaoPagamentoDescricao: condicaoPagamentoDescricao,
            tipo: tipoFormatado,
            sexo: sexoFormatado,
            dataCadastro: data.dataCadastro || '',
            ultimaModificacao: data.ultimaModificacao || '',
          };
          
          console.log('Cliente final com dados buscados:', clienteAtualizado);
          setCliente(clienteAtualizado);
        })
        .catch((error) => console.error('Erro ao buscar cliente:', error));
    }
  }, [id]);const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (name === 'tipo') {
      setCliente({ 
        ...cliente, 
        [name]: value,
        cnpjCpf: '',
        rgInscricaoEstadual: '',
        sexo: value === 'FISICA' ? cliente.sexo || '' : '',
        estadoCivil: value === 'JURIDICA' ? '' : cliente.estadoCivil
      });
    } else {
      setCliente({ ...cliente, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleNumericChange = (e, maxLength, maskFunction) => {
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
    
    setCliente({ ...cliente, [name]: value });
  };
  const getDisplayValue = (fieldName, value) => {
    if (!value) return '';
    
    switch (fieldName) {
      case 'telefone':
        return formatTelefone(value);
      case 'cep':
        return formatCEP(value);
      case 'cnpjCpf':
        return cliente.tipo === 'FISICA' ? formatCPF(value) : formatCNPJ(value);
      case 'rgInscricaoEstadual':
        if (cliente.tipo === 'FISICA') {
          return formatRG(value);
        } else {
          if (/^\d+$/.test(value)) {
            return formatIE(value);
          } else {
            return value;
          }
        }
      default:
        return value;
    }
  };
  const handleRgChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;
    
    if (cliente.tipo === 'FISICA') {
      value = value.replace(/[^0-9Xx]/g, '').toUpperCase();
      if (value.includes('X') && value.indexOf('X') !== value.length - 1) {
        value = value.replace(/X/g, '');
      }
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
    } else {
      value = value.toUpperCase();
      if (value.length > 12) {
        value = value.substring(0, 12);
      }
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setCliente({ ...cliente, [name]: value });
  };const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    const errors = {};
    
    if (!cliente.nome?.trim()) {
      errors.nome = 'Este campo é obrigatório';
    }
    
    if (!cliente.endereco?.trim()) {
      errors.endereco = 'Este campo é obrigatório';
    }
    
    if (!cliente.numero?.trim()) {
      errors.numero = 'Este campo é obrigatório';
    }
    
    if (!cliente.bairro?.trim()) {
      errors.bairro = 'Este campo é obrigatório';
    }
    
    if (!cliente.cep?.trim()) {
      errors.cep = 'Este campo é obrigatório';
    }
    
    if (!cliente.telefone?.trim()) {
      errors.telefone = 'Este campo é obrigatório';
    }
    
    if (!cliente.email?.trim()) {
      errors.email = 'Este campo é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!cliente.cidadeId) {
      errors.cidade = 'Selecione uma cidade';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    const telefoneSemMascara = cliente.telefone?.replace(/\D/g, '') || '';
    if (telefoneSemMascara.length !== 0 && (telefoneSemMascara.length < 10 || telefoneSemMascara.length > 11)) {
      setFieldErrors(prev => ({
        ...prev,
        telefone: 'O telefone deve ter 10 ou 11 dígitos.'
      }));
      return;
    }
    
    const cepSemMascara = cliente.cep?.replace(/\D/g, '') || '';
    if (cepSemMascara.length !== 0 && cepSemMascara.length !== 8) {
      setFieldErrors(prev => ({
        ...prev,
        cep: 'O CEP deve ter exatamente 8 dígitos.'
      }));
      return;
    }
    const cpfCnpjSemMascara = cliente.cnpjCpf?.replace(/\D/g, '') || '';
    const isCpf = cliente.tipo === 'FISICA';
    const tamanhoEsperado = isCpf ? 11 : 14;
    
    const isCidadeBrasileira = cliente.cidadeEstadoPais?.toLowerCase().includes('brasil') === true;
    
    if (cpfCnpjSemMascara.length !== 0 || isCidadeBrasileira) {
      if (cpfCnpjSemMascara.length !== 0) {
        if (cpfCnpjSemMascara.length !== tamanhoEsperado) {
          setFieldErrors(prev => ({
            ...prev,
            cnpjCpf: `O ${isCpf ? 'CPF' : 'CNPJ'} deve ter exatamente ${tamanhoEsperado} dígitos.`
          }));
          return;
        }
        
        const isDocumentoValido = isCpf ? validarCPF(cpfCnpjSemMascara) : validarCNPJ(cpfCnpjSemMascara);
        
        if (!isDocumentoValido) {
          setFieldErrors(prev => ({
            ...prev,
            cnpjCpf: `${isCpf ? 'CPF' : 'CNPJ'} inválido. Verifique os dígitos informados.`
          }));
          return;
        }
      } else if (isCidadeBrasileira) {
        setFieldErrors(prev => ({
          ...prev,
          cnpjCpf: `${isCpf ? 'CPF' : 'CNPJ'} é obrigatório para clientes brasileiros.`
        }));
        return;
      }
    }

    if (cliente.limiteCredito && parseFloat(cliente.limiteCredito) > 15000) {
      setFieldErrors(prev => ({
        ...prev,
        limiteCredito: 'O limite de crédito não pode ser superior a R$ 15.000,00'
      }));
      return;
    }

    const clienteFormatado = {
      ...cliente,
      limiteCredito: cliente.limiteCredito ? parseFloat(cliente.limiteCredito) : null,
      limiteCredito2: cliente.limiteCredito2 ? parseFloat(cliente.limiteCredito2) : null,
      tipo: cliente.tipo === 'FISICA' ? 0 : 1, // 0 FISICA, 1 JURIDICA
      sexo: cliente.sexo, // 'M' ou 'F'
      estadoCivil: cliente.estadoCivil,
      dataNascimento: cliente.dataNascimento || null,
      cnpjCpf: cliente.cnpjCpf?.trim() || null,
    };

    console.log('Dados enviados:', clienteFormatado);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/clientes/${id}` : 'http://localhost:8080/clientes';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clienteFormatado),
    })      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            let errorObj = null;
            try {
              errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar cliente';
              console.error('Resposta do servidor:', errorObj);
            } catch (e) {
              error = text || 'Erro ao salvar cliente';
              console.error('Resposta do servidor (texto):', text);
            }
            
            if (errorObj && errorObj.erro) {
              const errorMessage = errorObj.erro;
              if (errorMessage.includes('CNPJ/CPF') || errorMessage.includes('CPF') || errorMessage.includes('CNPJ')) {
                setFieldErrors(prev => ({
                  ...prev,
                  cnpjCpf: errorMessage
                }));
                throw new Error('');
              }
            }
            
            throw new Error(error);
          });
        }
        return response.json();
      })
      .then(() => {
        if (isModal) {
          onClose(); // This will be the onSaveSuccess function when provided
        } else {
          navigate('/clientes');
        }
      })      .catch((error) => {
        console.error('Erro capturado:', error);
        if (error.message.trim()) {
          setErrorMessage(error.message);
        }
      });
  };

  const handleCancel = () => {
    if (isModal) {
      onClose();
    } else {
      navigate('/clientes');
    }
  };

  const handleOpenCidadeModal = () => {
    setIsCidadeModalOpen(true);
  };

  const handleCloseCidadeModal = () => {
    setIsCidadeModalOpen(false);
  };
  const handleCidadeSelecionada = (cidade) => {
    if (fieldErrors.cidade) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cidade;
        return newErrors;
      });
    }
    
    const estado = estados.find(e => e.id === cidade.estadoId);
    const pais = estado ? paises.find(p => p.id === parseInt(estado.paisId)) : null;
    
    setCliente({
      ...cliente,
      cidadeId: cidade.id,
      cidadeNome: cidade.nome,
      cidadeEstado: estado ? estado.nome : '',
      cidadeEstadoPais: pais ? pais.nome : '',
    });
    setIsCidadeModalOpen(false);
  };
  
  const handleOpenCondicaoPagamentoModal = () => {
    setIsCondicaoPagamentoModalOpen(true);
  };

  const handleCloseCondicaoPagamentoModal = () => {
    setIsCondicaoPagamentoModalOpen(false);
  };

  const handleCondicaoPagamentoSelecionada = (condicao) => {
    setCliente({
      ...cliente,
      condicaoPagamentoId: condicao.id,
      condicaoPagamentoDescricao: condicao.descricao,
    });
    setIsCondicaoPagamentoModalOpen(false);
  };  return (    <Box sx={{ 
      padding: isModal ? 0 : { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa', 
      minHeight: isModal ? 'auto' : '100vh',
      paddingBottom: isModal ? 0 : 0.5
    }}>
      <Paper 
        component="form"
        onSubmit={handleSubmit}
        elevation={isModal ? 0 : 10}
        sx={{
          width: isModal ? '100%' : '95%',
          maxWidth: isModal ? 'none' : 1390,
          minHeight: isModal ? 'auto' : '70vh',
          mx: isModal ? 0 : 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          pb: 0,
          borderRadius: isModal ? 0 : 2,
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
      >        {/* Cabeçalho  */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Box sx={{ width: 120 }}></Box>
          
          <Typography 
            variant="h5" 
            component="h1" 
            align="center" 
            sx={{ color: '#333', fontWeight: 600, flex: 1 }}
          >
            {id ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </Typography>
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cliente.ativo}
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

          <Grid item sx={{ width: '16%', minWidth: 140 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Pessoa</InputLabel>
              <Select
                name="tipo"
                value={cliente.tipo}
                onChange={handleChange}
                label="Tipo de Pessoa"
              >
                <MenuItem value="FISICA">Pessoa Física</MenuItem>
                <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item sx={{ width: cliente.tipo === 'FISICA' ? '28%' : '35%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Cliente"
              name="nome"
              value={cliente.nome}
              onChange={handleChange}
              placeholder="Nome do cliente"
              variant="outlined"
              error={!!fieldErrors.nome}
              helperText={fieldErrors.nome || ''}
            />
          </Grid>          <Grid item sx={{ width: cliente.tipo === 'FISICA' ? '18%' : '27%' }}>
            <TextField
              fullWidth
              size="small"
              label={cliente.tipo === 'FISICA' ? 'Apelido' : 'Nome Fantasia'}
              name="apelido"
              value={cliente.apelido}
              onChange={handleChange}
              placeholder={cliente.tipo === 'FISICA' ? "Apelido" : "Nome Fantasia"}
              variant="outlined"
            />
          </Grid>
          {cliente.tipo === 'FISICA' && (
            <Grid item sx={{ width: '15%' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  name="estadoCivil"
                  value={cliente.estadoCivil}
                  onChange={handleChange}
                  label="Estado Civil"
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  <MenuItem value="SOLTEIRO">Solteiro(a)</MenuItem>
                  <MenuItem value="CASADO">Casado(a)</MenuItem>
                  <MenuItem value="DIVORCIADO">Divorciado(a)</MenuItem>
                  <MenuItem value="VIUVO">Viúvo(a)</MenuItem>
                  <MenuItem value="UNIAO_ESTAVEL">União Estável</MenuItem>
                  <MenuItem value="SEPARADO">Separado(a)</MenuItem>
                  <MenuItem value="OUTRO">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {/* Linha 2 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>

          <Grid item sx={{ width: '25%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Endereço"
              name="endereco"
              value={cliente.endereco}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
              variant="outlined"
              error={!!fieldErrors.endereco}
              helperText={fieldErrors.endereco || ''}
            />
          </Grid>              <Grid item sx={{ width: '8%', minWidth: 80 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Número"
              name="numero"
              value={cliente.numero}
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
              value={cliente.complemento}
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
              value={cliente.bairro}
              onChange={handleChange}
              placeholder="Bairro"
              variant="outlined"
              error={!!fieldErrors.bairro}
              helperText={fieldErrors.bairro || ''}
            />
          </Grid>          <Grid item sx={{ width: '10%', minWidth: 100 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="CEP"
              name="cep"
              value={getDisplayValue('cep', cliente.cep)}
              onChange={e => handleNumericChange(e, 8)}
              variant="outlined"
              error={!!fieldErrors.cep}
              helperText={fieldErrors.cep || ''}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

<Grid item sx={{ width: '20%', minWidth: 150 }}>
            <FormControl fullWidth variant="outlined" size="small" error={!!fieldErrors.cidade}>
              <TextField
                id="cidade-input"
                value={cliente.cidadeNome || ''}
                label="Cidade *"
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

        {/* Linha 3*/}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Telefone"
              name="telefone"
              value={getDisplayValue('telefone', cliente.telefone)}
              onChange={e => handleNumericChange(e, 11)}
              variant="outlined"
              error={!!fieldErrors.telefone}
              helperText={fieldErrors.telefone || ''}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>
          <Grid item sx={{ width: cliente.tipo === 'FISICA' ? '25%' : '25%' }}>
            <TextField
              fullWidth
              required
              type="email"
              size="small"
              label="Email"
              name="email"
              value={cliente.email}
              onChange={handleChange}
              placeholder="exemplo@email.com"
              variant="outlined"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ''}
            />
          </Grid>
          
          {cliente.tipo === 'FISICA' && (
            <Grid item sx={{ width: '15%', minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sexo</InputLabel>                <Select
                  name="sexo"
                  value={cliente.sexo}
                  onChange={handleChange}
                  label="Sexo"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item sx={{ width: cliente.tipo === 'FISICA' ? '20%' : '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label={cliente.tipo === 'FISICA' ? 'Data de Nascimento' : 'Data de Abertura'}
              name="dataNascimento"
              type="date"
              value={cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : ''}
              onChange={handleChange}
              inputProps={{ 
                max: new Date().toISOString().split('T')[0]
              }}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              error={false}
              helperText={''}
              autoComplete="off"
            />
          </Grid>
        </Grid>        

        {/* Linha 4*/}
        <Grid container spacing={2} sx={{ mb: 4 }}>          <Grid item sx={{ width: cliente.tipo === 'FISICA' ? '15%' : '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label={cliente.tipo === 'FISICA' ? 'CPF' : 'CNPJ'}
              name="cnpjCpf"
              value={getDisplayValue('cnpjCpf', cliente.cnpjCpf)}
              onChange={e => {
                const maxLength = cliente.tipo === 'FISICA' ? 11 : 14;
                handleNumericChange(e, maxLength);
              }}
              variant="outlined"
              error={!!fieldErrors.cnpjCpf}
              helperText={fieldErrors.cnpjCpf || ''}
              inputProps={{ inputMode: 'numeric' }}
              autoComplete="off"
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              size="small"
              label={cliente.tipo === 'FISICA' ? 'RG' : 'Inscrição Estadual'}
              name="rgInscricaoEstadual"
              value={getDisplayValue('rgInscricaoEstadual', cliente.rgInscricaoEstadual)}
              onChange={handleRgChange}
              variant="outlined"
              placeholder={cliente.tipo === 'FISICA' ? 'Ex: 123456789' : 'Ex: 123456789012 ou ISENTO'}
              inputProps={{ maxLength: cliente.tipo === 'FISICA' ? 15 : 20 }}
              autoComplete="off"
            />
          </Grid>
          
          <Grid item sx={{ width: '16%', minWidth: 120 }}>
            <TextField
              fullWidth
              size="small"
              label="Limite de Crédito"
              name="limiteCredito"
              type="number"
              value={cliente.limiteCredito}
              onChange={handleChange}
              placeholder="0,00"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>
              }}
              inputProps={{
                step: "0.01",
                min: "0",
                max: "15000"
              }}
              variant="outlined"
              error={!!fieldErrors.limiteCredito}
              helperText={fieldErrors.limiteCredito || ''}
            />
          </Grid>

            <Grid item sx={{ width: '30%', minWidth: 200 }}>
            <FormControl fullWidth variant="outlined" size="small">
              <TextField
                id="condicao-pagamento-input"
                value={cliente.condicaoPagamentoDescricao || ''}
                label="Condição de Pagamento"
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
                    <Tooltip title="Buscar condição de pagamento">
                      <IconButton 
                        onClick={handleOpenCondicaoPagamentoModal}
                        size="small"
                        color="primary"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </FormControl>
          </Grid>
        </Grid>        
        {/* Linha 5 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>          <Grid item sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Observações"
              name="observacao"
              value={cliente.observacao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o cliente"
              variant="outlined"
            />
          </Grid>        </Grid>

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
        )}        {/* registro e btns */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: '1px solid #eee',            position: 'sticky',
            bottom: '5px',
            backgroundColor: 'white',
            zIndex: 10,
            pb: 0.5,
            boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* registro */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {cliente.dataCadastro && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(cliente.dataCadastro).toLocaleString('pt-BR')}
              </Typography>
            )}
            {cliente.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(cliente.ultimaModificacao).toLocaleString('pt-BR')}
              </Typography>
            )}
          </Stack>

          {/* botões */}
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

      {/* Modal cidades */}
      {isCidadeModalOpen && (
        <CidadeModal
          onClose={handleCloseCidadeModal}
          onCidadeSelecionada={handleCidadeSelecionada}
        />
      )}
      
      {/* Modal cond pag*/}
      {isCondicaoPagamentoModalOpen && (
        <CondicaoPagamentoModal
          onClose={handleCloseCondicaoPagamentoModal}
          onCondicaoSelecionada={handleCondicaoPagamentoSelecionada}
        />
      )}
    </Box>
  );
};

export default ClienteForm;
