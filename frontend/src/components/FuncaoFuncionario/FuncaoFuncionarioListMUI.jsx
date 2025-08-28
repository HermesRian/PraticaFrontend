import React, { useState, useEffect } from 'react';
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
  Work as WorkIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const FuncaoFuncionarioListMUI = () => {
  const [funcoesFuncionario, setFuncoesFuncionario] = useState([]);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/funcoes-funcionario')
      .then(res => res.json())
      .then(data => {
        setFuncoesFuncionario(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar cargos');
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFuncoes = [...funcoesFuncionario].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

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
    setFuncoesFuncionario(sortedFuncoes);
  };

  const handleDelete = (id) => {
    const cargo = funcoesFuncionario.find(f => f.id === id);
    const isAtivo = cargo?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir este cargo?' : 
      'Tem certeza que deseja ativar este cargo?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/funcoes-funcionario/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status do cargo na lista local
          setFuncoesFuncionario(funcoesFuncionario.map(cargo => 
            cargo.id === id ? { ...cargo, ativo: !cargo.ativo } : cargo
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} cargo:`, error);
          setError(`Erro ao ${acao} cargo`);
        });
    }
  };

  const handleView = async (cargo) => {
    setCargoSelecionado(cargo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCargoSelecionado(null);
    setIsModalOpen(false);
  };

  const funcoesFiltradas = funcoesFuncionario.filter(cargo => {
    // Filtro por texto (código, nome, descrição)
    const matchesText = cargo.id?.toString().includes(filtro) ||
      cargo.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cargo.descricao?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && cargo.ativo) ||
      (filtroStatus === 'inativos' && !cargo.ativo);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando cargos...</Typography>
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
              placeholder="Pesquisar por código, nome, descrição..."
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
          </Box>
          <Button
            component={Link}
            to="/funcoes-funcionario/cadastrar"
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
            Exibindo {funcoesFiltradas.length} de {funcoesFuncionario.length} cargos
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
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'descricao'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('descricao')}
                    sx={{ fontWeight: 600 }}
                  >
                    Descrição
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cargaHoraria'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cargaHoraria')}
                    sx={{ fontWeight: 600 }}
                  >
                    Carga Horária
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Requer CNH
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
              {funcoesFiltradas.map((cargo) => (
                <TableRow 
                  key={cargo.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {cargo.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <WorkIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {cargo.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cargo.descricao || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cargo.cargaHoraria ? 
                        `${parseFloat(cargo.cargaHoraria).toFixed(2).replace('.', ',')} horas` : 
                        'Não informado'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cargo.requerCnh ? 'Sim' : 'Não'}
                      size="small"
                      color={cargo.requerCnh ? 'warning' : 'default'}
                      variant={cargo.requerCnh ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cargo.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={cargo.ativo ? 'success' : 'default'}
                      variant={cargo.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(cargo)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/funcoes-funcionario/editar/${cargo.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={cargo.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cargo.id)}
                          sx={{ color: cargo.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {cargo.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {funcoesFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {funcoesFuncionario.length === 0 
                ? 'Nenhum cargo cadastrado' 
                : `Nenhum cargo ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
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
          sx: { borderRadius: 2, minHeight: '60vh' }
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
            Visualizar Cargo
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {cargoSelecionado && (
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
                Dados do Cargo
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cargoSelecionado.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Nome, Descrição */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '6%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={cargoSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '35%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cargo"
                  value={cargoSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Carga Horária"
                  value={cargoSelecionado.cargaHoraria ? 
                    `${parseFloat(cargoSelecionado.cargaHoraria).toFixed(2).replace('.', ',')} horas` : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cargoSelecionado.requerCnh}
                      disabled
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
                  size="small"
                  label="Descrição"
                  value={cargoSelecionado.descricao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 3: Observações */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{width: '100%'}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Observações"
                  value={cargoSelecionado.observacao || ''}
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
                {cargoSelecionado.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(cargoSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {cargoSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(cargoSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
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
          {cargoSelecionado && (
            <Button
              component={Link}
              to={`/funcoes-funcionario/editar/${cargoSelecionado.id}`}
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

export default FuncaoFuncionarioListMUI;
