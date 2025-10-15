import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CidadeModal from '../Cidade/CidadeModal';
import CondicaoPagamentoModal from '../CondicaoPagamento/CondicaoPagamentoModal';
import { 
  validarCPF, 
  validarCNPJ, 
  formatCPF, 
  formatCNPJ 
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
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Stack,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const TransportadoraFormMUI = ({ id: propId, isModal = false, onClose }) => {
  const [transportadora, setTransportadora] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    tipo: 'JURIDICA', // Seguindo padrão do Cliente
    cpfCnpj: '',
    rgInscricaoEstadual: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    cidadeNome: '',
    cidadeEstado: '',
    cidadeEstadoPais: '',
    condicaoPagamentoId: '',
    condicaoPagamentoDescricao: '',
    observacao: '',
    ativo: true,
    dataCriacao: '',
    ultimaModificacao: ''
  });

  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;



  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/transportadoras/${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          console.log('Dados recebidos do backend:', data);

          let cidadeNome = '';
          let cidadeEstado = '';
          let cidadeEstadoPais = '';
          if (data.cidadeId) {
            try {
              const cidadeResponse = await fetch(`http://localhost:8080/cidades/${data.cidadeId}`);
              if (cidadeResponse.ok) {
                const cidadeData = await cidadeResponse.json();
                cidadeNome = cidadeData.nome || '';
                cidadeEstado = cidadeData.estado?.nome || '';
                cidadeEstadoPais = cidadeData.estado?.pais?.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar cidade:', error);
            }
          }

          let condicaoPagamentoDescricao = '';
          if (data.condicaoPagamentoId) {
            try {
              const condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${data.condicaoPagamentoId}`);
              if (condicaoResponse.ok) {
                const condicaoData = await condicaoResponse.json();
                condicaoPagamentoDescricao = condicaoData.nome || '';
              }
            } catch (error) {
              console.error('Erro ao buscar condição de pagamento:', error);
            }
          }

          const transportadoraAtualizada = {
            ...data,
            cidadeNome: cidadeNome,
            cidadeEstado: cidadeEstado,
            cidadeEstadoPais: cidadeEstadoPais,
            condicaoPagamentoDescricao: condicaoPagamentoDescricao,
            dataCriacao: data.dataCriacao || '',
            ultimaModificacao: data.ultimaModificacao || ''
          };

          console.log('Transportadora final com dados buscados:', transportadoraAtualizada);
          setTransportadora({
            ...transportadoraAtualizada,
            tipo: data.tipo === 'F' ? 'FISICA' : 'JURIDICA', // Converte para o padrão do Cliente
          });
        })
        .catch((error) => console.error('Erro ao buscar transportadora:', error));
    }
  }, [id]);

  // Função de formatação de campos
  const applyMask = (name, value) => {
    switch (name) {
      case 'cpfCnpj':
        return transportadora.tipo === 'FISICA' ? formatCPF(value) : formatCNPJ(value);
      default:
        return value;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Aplicar máscara se necessário
    const finalValue = type === 'checkbox' ? checked : applyMask(name, value);

    setTransportadora({ ...transportadora, [name]: finalValue });
  };



  const handleTelefoneChange = (e) => {
    const { name } = e.target;
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1');
      } else if (value.length <= 7) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setTransportadora({ ...transportadora, [name]: value });
  };



  const handleCepChange = (e) => {
    const { name } = e.target;
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setTransportadora({ ...transportadora, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setErrorMessage('');
    const errors = {};
    
    // Preparar CPF/CNPJ sem formatação para validação
    const cpfCnpjSemMascara = transportadora.cpfCnpj?.replace(/\D/g, '') || '';
    
    if (!transportadora.razaoSocial?.trim()) {
      errors.razaoSocial = 'Este campo é obrigatório';
    }

    // Validar CPF/CNPJ se informado
    if (cpfCnpjSemMascara.length > 0) {
      const isCpf = transportadora.tipo === 'FISICA';
      const tamanhoEsperado = isCpf ? 11 : 14;
      
      if (cpfCnpjSemMascara.length !== tamanhoEsperado) {
        errors.cpfCnpj = `O ${isCpf ? 'CPF' : 'CNPJ'} deve ter exatamente ${tamanhoEsperado} dígitos.`;
      } else {
        const isDocumentoValido = isCpf ? validarCPF(cpfCnpjSemMascara) : validarCNPJ(cpfCnpjSemMascara);
        if (!isDocumentoValido) {
          errors.cpfCnpj = `${isCpf ? 'CPF' : 'CNPJ'} inválido. Verifique os dígitos informados.`;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const transportadoraFormatada = {
      ...transportadora,
      tipo: transportadora.tipo === 'FISICA' ? 'F' : 'J', // Converte de volta para o backend
      cpfCnpj: cpfCnpjSemMascara, // Enviar sem formatação
      cidadeId: transportadora.cidadeId || null,
      condicaoPagamentoId: transportadora.condicaoPagamentoId || null,
    };

    // Remover campos que não devem ser enviados
    delete transportadoraFormatada.cidadeNome;
    delete transportadoraFormatada.cidadeEstado;
    delete transportadoraFormatada.cidadeEstadoPais;
    delete transportadoraFormatada.condicaoPagamentoDescricao;
    delete transportadoraFormatada.dataCriacao;
    delete transportadoraFormatada.ultimaModificacao;

    console.log('Dados enviados:', transportadoraFormatada);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/transportadoras/${id}` : 'http://localhost:8080/transportadoras';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transportadoraFormatada),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Erro na resposta:', response.status, response.statusText);
          
          return response.text().then(text => {
            let error;
            let errorObj = null;
            try {
              errorObj = JSON.parse(text);
              error = errorObj.erro || errorObj.message || 'Erro desconhecido ao salvar transportadora';
              console.error('Resposta do servidor:', errorObj);
            } catch {
              error = text || 'Erro ao salvar transportadora';
              console.error('Resposta do servidor (texto):', text);
            }
            
            if (errorObj && errorObj.erro) {
              const errorMessage = errorObj.erro;
              if (errorMessage.includes('cpfCnpj') || errorMessage.includes('CPF') || errorMessage.includes('CNPJ')) {
                setFieldErrors(prev => ({
                  ...prev,
                  cpfCnpj: errorMessage
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
          onClose();
        } else {
          navigate('/transportadoras');
        }
      })
      .catch((error) => {
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
      navigate('/transportadoras');
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

    setTransportadora(prev => ({
      ...prev,
      cidadeId: cidade.id,
      cidadeNome: `${cidade.nome} - ${cidade.estado?.nome || ''}`,
      cidadeEstado: cidade.estado?.nome || '',
      cidadeEstadoPais: cidade.estado?.pais?.nome || ''
    }));
    setIsCidadeModalOpen(false);
  };

  const handleOpenCondicaoPagamentoModal = () => {
    setIsCondicaoPagamentoModalOpen(true);
  };

  const handleCloseCondicaoPagamentoModal = () => {
    setIsCondicaoPagamentoModalOpen(false);
  };

  const handleCondicaoPagamentoSelecionada = (condicao) => {
    if (fieldErrors.condicaoPagamento) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.condicaoPagamento;
        return newErrors;
      });
    }

    setTransportadora(prev => ({
      ...prev,
      condicaoPagamentoId: condicao.id,
      condicaoPagamentoDescricao: condicao.nome || condicao.descricao || ''
    }));
    setIsCondicaoPagamentoModalOpen(false);
  };

  return (
    <Box sx={{ 
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
      >
        {/* Cabeçalho */}
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
            {id ? 'Editar Transportadora' : 'Cadastrar Nova Transportadora'}
          </Typography>
          <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={transportadora.ativo}
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
                value={transportadora.tipo}
                onChange={handleChange}
                label="Tipo de Pessoa"
              >
                <MenuItem value="FISICA">Pessoa Física</MenuItem>
                <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Transportadora"
              name="razaoSocial"
              value={transportadora.razaoSocial}
              onChange={handleChange}
              placeholder="Razão social da transportadora"
              variant="outlined"
              error={!!fieldErrors.razaoSocial}
              helperText={fieldErrors.razaoSocial || ''}
            />
          </Grid>

          <Grid item sx={{ width: '30%' }}>
            <TextField
              fullWidth
              size="small"
              label="Nome Fantasia"
              name="nomeFantasia"
              value={transportadora.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome Fantasia"
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '18%' }}>
            <TextField
              fullWidth
              size="small"
              label={transportadora.tipo === 'FISICA' ? 'CPF' : 'CNPJ'}
              name="cpfCnpj"
              value={transportadora.cpfCnpj}
              onChange={handleChange}
              placeholder={transportadora.tipo === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
              variant="outlined"
              error={!!fieldErrors.cpfCnpj}
              helperText={fieldErrors.cpfCnpj || ''}
            />
          </Grid>
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
              value={transportadora.endereco}
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
              value={transportadora.numero}
              onChange={handleChange}
              placeholder="Nº"
              variant="outlined"
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
              value={transportadora.complemento}
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
              value={transportadora.bairro}
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
              value={transportadora.cep}
              onChange={handleCepChange}
              variant="outlined"
              error={!!fieldErrors.cep}
              helperText={fieldErrors.cep || ''}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <FormControl fullWidth variant="outlined" size="small" error={!!fieldErrors.cidade}>
              <TextField
                id="cidade-input"
                value={transportadora.cidadeNome || ''}
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

          <Grid item sx={{ width: '11%', minWidth: 100 }}>
            <TextField
              fullWidth
              size="small"
              label="Telefone"
              name="telefone"
              value={transportadora.telefone}
              onChange={handleTelefoneChange}
              placeholder="(00) 00000-0000"
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Linha 3*/}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item sx={{ width: '20%', minWidth: 150 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Email"
              name="email"
              type="email"
              value={transportadora.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              variant="outlined"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ''}
            />
          </Grid>

          <Grid item sx={{ width: '15%', minWidth: 120 }}>
            <TextField
              fullWidth
              size="small"
              label={transportadora.tipo === 'FISICA' ? 'RG' : 'Inscrição Estadual'}
              name="rgInscricaoEstadual"
              value={transportadora.rgInscricaoEstadual}
              onChange={handleChange}
              placeholder={transportadora.tipo === 'FISICA' ? 'RG' : 'Inscrição Estadual'}
              variant="outlined"
            />
          </Grid>

          <Grid item sx={{ width: '20%', minWidth: 140 }}>
            <FormControl fullWidth variant="outlined" size="small" error={!!fieldErrors.condicaoPagamento}>
              <TextField
                id="condicaoPagamento-input"
                value={transportadora.condicaoPagamentoDescricao || ''}
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
                error={!!fieldErrors.condicaoPagamento}
                helperText={fieldErrors.condicaoPagamento || ''}
              />
            </FormControl>
          </Grid>

          <Grid item sx={{ width: '45%' }}>
            <TextField
              fullWidth
              size="small"
              label="Observação"
              name="observacao"
              value={transportadora.observacao}
              onChange={handleChange}
              placeholder="Observações gerais"
              variant="outlined"
              multiline
              minRows={1}
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

        {/* Registro e botões */}
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
          {/* Registros */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {transportadora.dataCriacao && (
              <Typography variant="caption" color="text.secondary">
                Data de cadastro: {new Date(transportadora.dataCriacao).toLocaleString('pt-BR')}
              </Typography>
            )}
            {transportadora.ultimaModificacao && (
              <Typography variant="caption" color="text.secondary">
                Última modificação: {new Date(transportadora.ultimaModificacao).toLocaleString('pt-BR')}
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

      {/* Modal de Cidade */}
      {isCidadeModalOpen && (
        <CidadeModal
          onClose={handleCloseCidadeModal}
          onCidadeSelecionada={handleCidadeSelecionada}
        />
      )}

      {/* Modal de Condição de Pagamento */}
      {isCondicaoPagamentoModalOpen && (
        <CondicaoPagamentoModal
          onClose={handleCloseCondicaoPagamentoModal}
          onCondicaoSelecionada={handleCondicaoPagamentoSelecionada}
        />
      )}
    </Box>
  );
};

export default TransportadoraFormMUI;