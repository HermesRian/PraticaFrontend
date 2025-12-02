import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { formatCPF, formatCEP, formatTelefone, censurarCPF } from '../../utils/documentValidation';

const FuncionarioListMUI = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarDocumentoCompleto, setMostrarDocumentoCompleto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/funcionarios').then(res => res.json()),
      fetch('http://localhost:8080/cidades').then(res => res.json()),
      fetch('http://localhost:8080/funcoes-funcionario').then(res => res.json())
    ])
    .then(([funcionariosData, cidadesData, cargosData]) => {
      setFuncionarios(funcionariosData);
      setCidades(cidadesData);
      setCargos(cargosData);
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

  const getCargoNome = (funcaoFuncionarioId) => {
    const cargo = cargos.find((c) => c.id === funcaoFuncionarioId);
    return cargo ? cargo.nome : 'Não informado';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFuncionarios = [...funcionarios].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'cidade') {
        aValue = getCidadeNome(a.cidadeId);
        bValue = getCidadeNome(b.cidadeId);
      }

      if (key === 'cargo') {
        aValue = getCargoNome(a.funcaoFuncionarioId);
        bValue = getCargoNome(b.funcaoFuncionarioId);
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
    setFuncionarios(sortedFuncionarios);
  };

  const handleDelete = (id) => {
    const funcionario = funcionarios.find(f => f.id === id);
    const isAtivo = funcionario?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir este funcionário?' : 
      'Tem certeza que deseja ativar este funcionário?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/funcionarios/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status do funcionário na lista local
          setFuncionarios(funcionarios.map(funcionario => 
            funcionario.id === id ? { ...funcionario, ativo: !funcionario.ativo } : funcionario
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} funcionário:`, error);
          setError(`Erro ao ${acao} funcionário`);
        });
    }
  };

  const handleView = async (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFuncionarioSelecionado(null);
    setIsModalOpen(false);
  };

  const funcionariosFiltrados = funcionarios.filter(funcionario => {
    // Filtro por texto (código, nome, CPF, email, cidade)
    const matchesText = funcionario.id?.toString().includes(filtro) ||
      funcionario.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      funcionario.cpfCnpj?.toLowerCase().includes(filtro.toLowerCase()) ||
      funcionario.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      getCidadeNome(funcionario.cidadeId)?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && funcionario.ativo) ||
      (filtroStatus === 'inativos' && !funcionario.ativo);
    
    return matchesText && matchesStatus;
  });

  const getSexoLabel = (sexo) => {
    switch (sexo) {
      case 0: return 'Masculino';
      case 1: return 'Feminino';
      default: return 'Não informado';
    }
  };

  const getEstadoCivilLabel = (estadoCivil) => {
    switch (estadoCivil) {
      case 0: return 'Solteiro(a)';
      case 1: return 'Casado(a)';
      case 2: return 'Divorciado(a)';
      case 3: return 'Viúvo(a)';
      case 4: return 'União Estável';
      case 5: return 'Separado(a)';
      case 6: return 'Outro';
      default: return 'Não informado';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando funcionários...</Typography>
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
              placeholder="Pesquisar por código, nome, CPF, email..."
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
            to="/funcionarios/cadastrar"
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
            Exibindo {funcionariosFiltrados.length} de {funcionarios.length} funcionários
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
                    Funcionário
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cargo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cargo')}
                    sx={{ fontWeight: 600 }}
                  >
                    Cargo
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cpfCnpj'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cpfCnpj')}
                    sx={{ fontWeight: 600 }}
                  >
                    CPF
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
              {funcionariosFiltrados.map((funcionario) => (
                <TableRow 
                  key={funcionario.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {funcionario.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {funcionario.nome}
                        </Typography>
                        {funcionario.apelido && (
                          <Typography variant="caption" color="text.secondary">
                            {funcionario.apelido}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCargoNome(funcionario.funcaoFuncionarioId)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {funcionario.cpfCnpj ? (
                        mostrarDocumentoCompleto ? formatCPF(funcionario.cpfCnpj) : censurarCPF(funcionario.cpfCnpj)
                      ) : 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {funcionario.email || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCidadeNome(funcionario.cidadeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={funcionario.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={funcionario.ativo ? 'success' : 'default'}
                      variant={funcionario.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(funcionario)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/funcionarios/editar/${funcionario.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={funcionario.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(funcionario.id)}
                          sx={{ color: funcionario.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {funcionario.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {funcionariosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {funcionarios.length === 0 
                ? 'Nenhum funcionário cadastrado' 
                : `Nenhum funcionário ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
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
            Visualizar Funcionário
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {funcionarioSelecionado && (
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
                Dados do Funcionário
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={funcionarioSelecionado.ativo}
                      disabled
                      color="primary"
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
                  value={funcionarioSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '35%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Funcionário"
                  value={funcionarioSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Apelido"
                  value={funcionarioSelecionado.apelido || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cargo"
                  value={getCargoNome(funcionarioSelecionado.funcaoFuncionarioId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 2: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endereço"
                  value={funcionarioSelecionado.endereco || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '5%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={funcionarioSelecionado.numero || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
                
              <Grid item sx={{ width: '13%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Complemento"
                  value={funcionarioSelecionado.complemento || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '13%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bairro"
                  value={funcionarioSelecionado.bairro || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '10%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CEP"
                  value={formatCEP(funcionarioSelecionado.cep) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade"
                  value={getCidadeNome(funcionarioSelecionado.cidadeId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 3: Telefone, Email, Sexo, Data de Nascimento, Estado Civil */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefone"
                  value={formatTelefone(funcionarioSelecionado.telefone) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={funcionarioSelecionado.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '10%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sexo"
                  value={getSexoLabel(funcionarioSelecionado.sexo)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Nascimento"
                  value={funcionarioSelecionado.dataNascimento ? 
                    new Date(funcionarioSelecionado.dataNascimento).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estado Civil"
                  value={getEstadoCivilLabel(funcionarioSelecionado.estadoCivil)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 4: CPF, RG, CNH, Validade CNH */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CPF"
                  value={funcionarioSelecionado.cpfCnpj ? formatCPF(funcionarioSelecionado.cpfCnpj) : ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="RG"
                  value={funcionarioSelecionado.rgInscricaoEstadual || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CNH"
                  value={funcionarioSelecionado.cnh || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Validade CNH"
                  value={funcionarioSelecionado.dataValidadeCnh ? 
                    new Date(funcionarioSelecionado.dataValidadeCnh).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 5: Data de Admissão, Salário, Data de Demissão */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Admissão"
                  value={funcionarioSelecionado.dataAdmissao ? 
                    new Date(funcionarioSelecionado.dataAdmissao).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Salário"
                  value={funcionarioSelecionado.salario ? 
                    `R$ ${parseFloat(funcionarioSelecionado.salario).toFixed(2).replace('.', ',')}` : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Demissão"
                  value={funcionarioSelecionado.dataDemissao ? 
                    new Date(funcionarioSelecionado.dataDemissao).toLocaleDateString('pt-BR') : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 6: Observações */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{width: '100%'}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Observações"
                  value={funcionarioSelecionado.observacao || ''}
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
                {funcionarioSelecionado.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(funcionarioSelecionado.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {funcionarioSelecionado.dataAlteracao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(funcionarioSelecionado.dataAlteracao).toLocaleString('pt-BR')}
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
          {funcionarioSelecionado && (
            <Button
              component={Link}
              to={`/funcionarios/editar/${funcionarioSelecionado.id}`}
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

export default FuncionarioListMUI;
