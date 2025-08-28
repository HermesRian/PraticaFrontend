import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const FornecedorListMUI = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarDocumentoCompleto, setMostrarDocumentoCompleto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/fornecedores').then(res => res.json()),
      fetch('http://localhost:8080/cidades').then(res => res.json())
    ])
    .then(([fornecedoresData, cidadesData]) => {
      setFornecedores(fornecedoresData);
      setCidades(cidadesData);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
      setLoading(false);
    });
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

    const sortedFornecedores = [...fornecedores].sort((a, b) => {
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
    setFornecedores(sortedFornecedores);
  };

  const handleDelete = (id) => {
    const fornecedor = fornecedores.find(f => f.id === id);
    const isAtivo = fornecedor?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir este fornecedor?' : 
      'Tem certeza que deseja ativar este fornecedor?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/fornecedores/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status do fornecedor na lista local
          setFornecedores(fornecedores.map(fornecedor => 
            fornecedor.id === id ? { ...fornecedor, ativo: !fornecedor.ativo } : fornecedor
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} fornecedor:`, error);
          setError(`Erro ao ${acao} fornecedor`);
        });
    }
  };

  const handleView = async (fornecedor) => {
    // Buscar descrição da condição de pagamento se condicaoPagamentoId estiver presente
    let fornecedorComCondicaoPagamento = { ...fornecedor };
    
    if (fornecedor.condicaoPagamentoId) {
      try {
        console.log('Buscando condição de pagamento com ID:', fornecedor.condicaoPagamentoId);
        const condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${fornecedor.condicaoPagamentoId}`);
        
        if (condicaoResponse.ok) {
          const condicaoData = await condicaoResponse.json();
          fornecedorComCondicaoPagamento.condicaoPagamentoDescricao = condicaoData.descricao || '';
          console.log('Descrição da condição de pagamento encontrada:', condicaoData.descricao);
        } else {
          console.error('Erro ao buscar condição de pagamento, status:', condicaoResponse.status);
          fornecedorComCondicaoPagamento.condicaoPagamentoDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar condição de pagamento:', error);
        fornecedorComCondicaoPagamento.condicaoPagamentoDescricao = 'Erro ao carregar';
      }
    }
    
    setFornecedorSelecionado(fornecedorComCondicaoPagamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFornecedorSelecionado(null);
    setIsModalOpen(false);
  };

  const fornecedoresFiltrados = fornecedores.filter(fornecedor => {
    // Filtro por texto (código, nome, CPF/CNPJ, email, cidade)
    const matchesText = fornecedor.id?.toString().includes(filtro) ||
      fornecedor.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedor.cnpjCpf?.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedor.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      getCidadeNome(fornecedor.cidadeId)?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && fornecedor.ativo) ||
      (filtroStatus === 'inativos' && !fornecedor.ativo);
    
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
        <Typography>Carregando fornecedores...</Typography>
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
      >
        {/* Cabeçalho com pesquisa e botão */}
        <Box sx={{ 
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
            component={Link}
            to="/fornecedores/cadastrar"
            variant="contained"
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
            Exibindo {fornecedoresFiltrados.length} de {fornecedores.length} fornecedores
            {filtroStatus !== 'todos' && ` (${filtroStatus})`}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
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
                    Fornecedor
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
              {fornecedoresFiltrados.map((fornecedor) => (
                <TableRow 
                  key={fornecedor.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {fornecedor.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        {getTipoLabel(fornecedor.tipo) === 'Pessoa Física' ? 
                          <PersonIcon fontSize="small" /> : 
                          <BusinessIcon fontSize="small" />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {fornecedor.nome}
                        </Typography>
                        {fornecedor.apelido && (
                          <Typography variant="caption" color="text.secondary">
                            {fornecedor.apelido}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoLabel(fornecedor.tipo)}
                      size="small"
                      color={getTipoLabel(fornecedor.tipo) === 'Pessoa Física' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {fornecedor.cnpjCpf ? (
                        getTipoLabel(fornecedor.tipo) === 'Pessoa Física' ? 
                        (mostrarDocumentoCompleto ? formatCPF(fornecedor.cnpjCpf) : censurarCPF(fornecedor.cnpjCpf)) : 
                        (mostrarDocumentoCompleto ? formatCNPJ(fornecedor.cnpjCpf) : censurarCNPJ(fornecedor.cnpjCpf))
                      ) : 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {fornecedor.email || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCidadeNome(fornecedor.cidadeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={fornecedor.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={fornecedor.ativo ? 'success' : 'default'}
                      variant={fornecedor.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(fornecedor)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/fornecedores/editar/${fornecedor.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={fornecedor.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(fornecedor.id)}
                          sx={{ color: fornecedor.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {fornecedor.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {fornecedoresFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {fornecedores.length === 0 
                ? 'Nenhum fornecedor cadastrado' 
                : `Nenhum fornecedor ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
              }
            </Typography>
            {filtro && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Termo pesquisado: "{filtro}"
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Modal de Visualização */}
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
            Visualizar Fornecedor
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {fornecedorSelecionado && (
          <DialogContent sx={{ p: 4 }}>
            {/* Cabeçalho com título e switch Ativo */}
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
                Dados do Fornecedor
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={fornecedorSelecionado.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Tipo de Pessoa, Nome, Apelido, Estado Civil */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '6%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={fornecedorSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '16%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Pessoa"
                  value={getTipoLabel(fornecedorSelecionado.tipo)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fornecedor"
                  value={fornecedorSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? '18%' : '38%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? 'Apelido' : 'Nome Fantasia'}
                  value={fornecedorSelecionado.apelido || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              {getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' && (
                <Grid item sx={{ width: '20%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Estado Civil"
                    value={getEstadoCivilLabel(fornecedorSelecionado.estadoCivil)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            {/* Linha 2: Rua, Número, Complemento, Bairro, CEP, Cidade */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endereço"
                  value={fornecedorSelecionado.endereco || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '5%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={fornecedorSelecionado.numero || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
                
              <Grid item sx={{ width: '13%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Complemento"
                  value={fornecedorSelecionado.complemento || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '13%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bairro"
                  value={fornecedorSelecionado.bairro || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '10%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CEP"
                  value={formatCEP(fornecedorSelecionado.cep) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade"
                  value={getCidadeNome(fornecedorSelecionado.cidadeId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 3: Telefone, Email, Sexo (somente para PF), Data de Nascimento */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefone"
                  value={formatTelefone(fornecedorSelecionado.telefone) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={fornecedorSelecionado.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              {getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' && (
                <Grid item sx={{ width: '10%', minWidth: 120 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Sexo"
                    value={getSexoLabel(fornecedorSelecionado.sexo)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}
              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? 'Data de Nascimento' : 'Data de Abertura'}
                  value={fornecedorSelecionado.dataNascimento ? 
                    new Date(fornecedorSelecionado.dataNascimento).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 4: RG/IE, CPF/CNPJ, Limite de Crédito, Condição de Pagamento */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? 'RG' : 'Inscrição Estadual'}
                  value={fornecedorSelecionado.rgInscricaoEstadual || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
                  value={fornecedorSelecionado.cnpjCpf ? (
                    getTipoLabel(fornecedorSelecionado.tipo) === 'Pessoa Física' ? 
                    formatCPF(fornecedorSelecionado.cnpjCpf) : 
                    formatCNPJ(fornecedorSelecionado.cnpjCpf)
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
                  value={fornecedorSelecionado.limiteCredito ? 
                    `R$ ${parseFloat(fornecedorSelecionado.limiteCredito).toFixed(2).replace('.', ',')}` : 
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
                  value={fornecedorSelecionado.condicaoPagamentoDescricao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 5: Observações */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{width: '100%'}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Observações"
                  value={fornecedorSelecionado.observacao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Informações de cadastro */}
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
                {fornecedorSelecionado.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(fornecedorSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {fornecedorSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(fornecedorSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
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
          {fornecedorSelecionado && (
            <Button
              component={Link}
              to={`/fornecedores/editar/${fornecedorSelecionado.id}`}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleCloseModal}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FornecedorListMUI;
