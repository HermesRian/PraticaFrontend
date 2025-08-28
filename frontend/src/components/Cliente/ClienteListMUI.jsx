import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ClienteModalForm from './ClienteModalForm';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Alert,
  Avatar,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { formatCPF, formatCNPJ, formatCEP, formatTelefone, censurarCPF, censurarCNPJ } from '../../utils/documentValidation';

const ClienteListMUI = () => {
  const [clientes, setClientes] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarDocumentoCompleto, setMostrarDocumentoCompleto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientesData, cidadesData] = await Promise.all([
        fetch('http://localhost:8080/clientes').then(res => res.json()),
        fetch('http://localhost:8080/cidades').then(res => res.json())
      ]);
      setClientes(clientesData);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCidadeNome = (cidadeId) => {
    const cidade = cidades.find((c) => c.id === cidadeId);
    return cidade ? cidade.nome : 'Não informada';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedClientes = [...clientes].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'cidade') {
        aValue = getCidadeNome(a.cidadeId);
        bValue = getCidadeNome(b.cidadeId);
      }

      if (key === 'ativo') {
        aValue = a.ativo ? 1 : 0;
        bValue = b.ativo ? 1 : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setClientes(sortedClientes);
  };

  const handleDelete = (id) => {
    const cliente = clientes.find(c => c.id === id);
    const isAtivo = cliente?.ativo;
    const acao = isAtivo ? 'inativar' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja inativar este cliente?' : 
      'Tem certeza que deseja ativar este cliente?';
    
    if (window.confirm(mensagem)) {
      if (isAtivo) {
        fetch(`http://localhost:8080/clientes/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setClientes(clientes.map(cliente => 
              cliente.id === id ? { ...cliente, ativo: false } : cliente
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} cliente:`, error);
            setError(`Erro ao ${acao} cliente`);
          });
      } else {
        const clienteAtualizado = {
          ...cliente,
          ativo: true,
          tipo: getTipoLabel(cliente.tipo) === 'Pessoa Física' ? 0 : 1,
          limiteCredito: cliente.limiteCredito ? parseFloat(cliente.limiteCredito) : null,
          limiteCredito2: cliente.limiteCredito2 ? parseFloat(cliente.limiteCredito2) : null,
          dataNascimento: cliente.dataNascimento || null,
          cnpjCpf: cliente.cnpjCpf?.trim() || null,
        };

        fetch(`http://localhost:8080/clientes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clienteAtualizado),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao ativar cliente');
            }
            return response.json();
          })
          .then(() => {
            setClientes(clientes.map(cliente => 
              cliente.id === id ? { ...cliente, ativo: true } : cliente
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} cliente:`, error);
            setError(`Erro ao ${acao} cliente`);
          });
      }
    }
  };
  const handleView = async (cliente) => {
    let clienteComCondicaoPagamento = { ...cliente };
    
    if (cliente.condicaoPagamentoId) {
      try {
        console.log('Buscando condição de pagamento com ID:', cliente.condicaoPagamentoId);
        const condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${cliente.condicaoPagamentoId}`);
        
        if (condicaoResponse.ok) {
          const condicaoData = await condicaoResponse.json();
          clienteComCondicaoPagamento.condicaoPagamentoDescricao = condicaoData.descricao || '';
          console.log('Descrição da condição de pagamento encontrada:', condicaoData.descricao);
        } else {
          console.error('Erro ao buscar condição de pagamento, status:', condicaoResponse.status);
          clienteComCondicaoPagamento.condicaoPagamentoDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar condição de pagamento:', error);
        clienteComCondicaoPagamento.condicaoPagamentoDescricao = 'Erro ao carregar';
      }
    }
    
    setClienteSelecionado(clienteComCondicaoPagamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClienteSelecionado(null);
    setIsModalOpen(false);
  };
  const clientesFiltrados = clientes.filter(cliente => {
    const matchesText = cliente.id?.toString().includes(filtro) ||
      cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.cnpjCpf?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      getCidadeNome(cliente.cidadeId)?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && cliente.ativo) ||
      (filtroStatus === 'inativos' && !cliente.ativo);
    
    return matchesText && matchesStatus;
  });

  const getTipoLabel = (tipo) => {
    if (typeof tipo === 'number') {
      return tipo === 0 ? 'Pessoa Física' : 'Pessoa Jurídica';
    }
    return tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  const getSexoLabel = (sexo) => {
    switch (sexo) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      case 'O': return 'Outro';
      default: return 'Não informado';
    }
  };

  const getEstadoCivilLabel = (estadoCivil) => {
    switch (estadoCivil) {
      case 'SOLTEIRO': return 'Solteiro(a)';
      case 'CASADO': return 'Casado(a)';
      case 'DIVORCIADO': return 'Divorciado(a)';
      case 'VIUVO': return 'Viúvo(a)';
      case 'UNIAO_ESTAVEL': return 'União Estável';
      case 'SEPARADO': return 'Separado(a)';
      case 'OUTRO': return 'Outro';
      default: return 'Não informado';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando clientes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <Paper 
        elevation={10}
        sx={{
          width: '95%',
          maxWidth: 1400,
          mx: 'auto',
          p: { xs: 2, md: 3, lg: 4 },
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >        {/* Cabeçalho  */}        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <TextField
              variant="outlined"
              placeholder="Pesquisar por código, nome, CPF/CNPJ, email..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
                sx={{ height: 40 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativos">Ativos</MenuItem>
                <MenuItem value="inativos">Inativos</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch 
                  checked={mostrarDocumentoCompleto}
                  onChange={(e) => setMostrarDocumentoCompleto(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>Exibir documentos completos</Typography>}
            />
          </Box>
          <Button
            variant="contained"
            onClick={() => setIsFormModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              borderRadius: 2,
              px: 3,
              py: 1,
              height: 40,
              whiteSpace: 'nowrap'
            }}
          >
            Adicionar
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabela */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Exibindo {clientesFiltrados.length} de {clientes.length} clientes
            {filtroStatus !== 'todos' && ` (${filtroStatus})`}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'id'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('id')}
                    sx={{ fontWeight: 600 }}
                  >
                    Código
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'nome'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('nome')}
                    sx={{ fontWeight: 600 }}
                  >
                    Cliente
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'tipo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('tipo')}
                    sx={{ fontWeight: 600 }}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cnpjCpf'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cnpjCpf')}
                    sx={{ fontWeight: 600 }}
                  >
                    CPF/CNPJ
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'email'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('email')}
                    sx={{ fontWeight: 600 }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cidade'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cidade')}
                    sx={{ fontWeight: 600 }}
                  >
                    Cidade
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'ativo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('ativo')}
                    sx={{ fontWeight: 600 }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.map((cliente) => (                <TableRow 
                  key={cliente.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {cliente.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        {getTipoLabel(cliente.tipo) === 'Pessoa Física' ? 
                          <PersonIcon fontSize="small" /> : 
                          <BusinessIcon fontSize="small" />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {cliente.nome}
                        </Typography>
                        {cliente.apelido && (
                          <Typography variant="caption" color="text.secondary">
                            {cliente.apelido}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoLabel(cliente.tipo)}
                      size="small"
                      color={getTipoLabel(cliente.tipo) === 'Pessoa Física' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {cliente.cnpjCpf ? (
                        getTipoLabel(cliente.tipo) === 'Pessoa Física' ? 
                        (mostrarDocumentoCompleto ? formatCPF(cliente.cnpjCpf) : censurarCPF(cliente.cnpjCpf)) : 
                        (mostrarDocumentoCompleto ? formatCNPJ(cliente.cnpjCpf) : censurarCNPJ(cliente.cnpjCpf))
                      ) : 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cliente.email || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCidadeNome(cliente.cidadeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cliente.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={cliente.ativo ? 'success' : 'default'}
                      variant={cliente.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(cliente)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/clientes/editar/${cliente.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={cliente.ativo ? "Inativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cliente.id)}
                          sx={{ color: cliente.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {cliente.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {clientesFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {clientes.length === 0 
                ? 'Nenhum cliente cadastrado' 
                : `Nenhum cliente ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
              }
            </Typography>
            {filtro && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Termo pesquisado: "{filtro}"
              </Typography>
            )}
          </Box>
        )}
      </Paper>      {/* Modal de Visualização */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f5f5f5', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h6" fontWeight={600}>
            Visualizar Cliente
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {clienteSelecionado && (
          <DialogContent sx={{ p: 4 }}>

            {/* titulo e switch */}
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
                Dados do Cliente
              </Typography>              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={clienteSelecionado.ativo}
                      disabled
                      color="primary"
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
                  value={clienteSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '16%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Pessoa"
                  value={getTipoLabel(clienteSelecionado.tipo)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cliente"
                  value={clienteSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>              <Grid item sx={{ width: getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? '18%' : '38%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? 'Apelido' : 'Nome Fantasia'}
                  value={clienteSelecionado.apelido || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              {getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' && (
                <Grid item sx={{ width: '20%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Estado Civil"
                    value={getEstadoCivilLabel(clienteSelecionado.estadoCivil)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            {/* Linha 2 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endereço"
                  value={clienteSelecionado.endereco || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '5%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={clienteSelecionado.numero || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
                
              <Grid item sx={{ width: '13%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Complemento"
                  value={clienteSelecionado.complemento || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '13%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bairro"
                  value={clienteSelecionado.bairro || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '10%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CEP"
                  value={formatCEP(clienteSelecionado.cep) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade"
                  value={getCidadeNome(clienteSelecionado.cidadeId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>            
            {/* Linha 3 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefone"
                  value={formatTelefone(clienteSelecionado.telefone) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={clienteSelecionado.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              {getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' && (
                <Grid item sx={{ width: '10%', minWidth: 120 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Sexo"
                    value={getSexoLabel(clienteSelecionado.sexo)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}
              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? 'Data de Nascimento' : 'Data de Abertura'}
                  value={clienteSelecionado.dataNascimento ? 
                    new Date(clienteSelecionado.dataNascimento).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>


            </Grid>            {/* Linha 4 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? 'RG' : 'Inscrição Estadual'}
                  value={clienteSelecionado.rgInscricaoEstadual || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
                  value={clienteSelecionado.cnpjCpf ? (
                    getTipoLabel(clienteSelecionado.tipo) === 'Pessoa Física' ? 
                    formatCPF(clienteSelecionado.cnpjCpf) : 
                    formatCNPJ(clienteSelecionado.cnpjCpf)
                  ) : ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Limite de Crédito"
                  value={clienteSelecionado.limiteCredito ? 
                    `R$ ${parseFloat(clienteSelecionado.limiteCredito).toFixed(2).replace('.', ',')}` : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '35%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Condição de Pagamento"
                  value={clienteSelecionado.condicaoPagamentoDescricao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>            </Grid>            

              {/* Linha 5: Observações */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{width: '100%'}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Observações"
                  value={clienteSelecionado.observacao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* registros */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 2,
                mt: 3,
                pt: 2,
                borderTop: '1px solid #eee',
              }}
            >
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                {clienteSelecionado.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(clienteSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {clienteSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(clienteSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Stack>
            </Box>
          </DialogContent>
        )}
        
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="inherit"
          >
            Fechar
          </Button>
          {clienteSelecionado && (
            <Button
              component={Link}
              to={`/clientes/editar/${clienteSelecionado.id}`}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleCloseModal}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ClienteModalForm 
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedClienteId(null);
        }}
        onSaveSuccess={() => {
          loadData();
          setIsFormModalOpen(false);
          setSelectedClienteId(null);
        }}
        clienteId={selectedClienteId}
      />
    </Box>
  );
};

export default ClienteListMUI;
