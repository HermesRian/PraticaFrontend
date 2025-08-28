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
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const EstadoListMUI = () => {
  const [estados, setEstados] = useState([]);
  const [paises, setPaises] = useState({});
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar estados
    fetch('http://localhost:8080/estados')
      .then((response) => response.json())
      .then((data) => {
        setEstados(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar estados:', error);
        setError('Erro ao carregar dados dos estados');
        setLoading(false);
      });

    // Buscar países para exibir os nomes
    fetch('http://localhost:8080/paises')
      .then((response) => response.json())
      .then((data) => {
        const paisesMap = {};
        data.forEach((pais) => {
          paisesMap[pais.id] = pais.nome;
        });
        setPaises(paisesMap);
      })
      .catch((error) => {
        console.error('Erro ao buscar países:', error);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedEstados = [...estados].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para a coluna "pais", usamos o nome do país
      if (key === 'pais') {
        aValue = paises[a.paisId] || 'Desconhecido';
        bValue = paises[b.paisId] || 'Desconhecido';
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
    setEstados(sortedEstados);
  };

  const handleDelete = (id) => {
    const estado = estados.find(e => e.id === id);
    const isAtivo = estado?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir este estado?' : 
      'Tem certeza que deseja ativar este estado?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/estados/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status do estado na lista local ou remove completamente
          setEstados(estados.filter(estado => estado.id !== id));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} estado:`, error);
          setError(`Erro ao ${acao} estado`);
        });
    }
  };

  const handleView = async (estado) => {
    setEstadoSelecionado(estado);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEstadoSelecionado(null);
    setIsModalOpen(false);
  };

  const estadosFiltrados = estados.filter(estado => {
    // Filtro por texto (código, nome, uf, país)
    const paisNome = paises[estado.paisId] || '';
    const matchesText = estado.id?.toString().includes(filtro) ||
      estado.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      estado.uf?.toLowerCase().includes(filtro.toLowerCase()) ||
      paisNome.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && estado.ativo !== false) ||
      (filtroStatus === 'inativos' && estado.ativo === false);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando estados...</Typography>
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
              placeholder="Pesquisar por código, nome, UF ou país..."
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
                width: { xs: '100%', sm: 350 },
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
            to="/estados/cadastrar"
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
            Exibindo {estadosFiltrados.length} de {estados.length} estados
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
                    active={sortConfig.key === 'uf'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('uf')}
                    sx={{ fontWeight: 600 }}
                  >
                    UF
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'pais'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('pais')}
                    sx={{ fontWeight: 600 }}
                  >
                    País
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
              {estadosFiltrados.map((estado) => (
                <TableRow 
                  key={estado.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {estado.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <LocationOnIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {estado.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={estado.uf}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {paises[estado.paisId] || 'Desconhecido'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={estado.ativo !== false ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={estado.ativo !== false ? 'success' : 'default'}
                      variant={estado.ativo !== false ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(estado)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/estados/editar/${estado.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={estado.ativo !== false ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(estado.id)}
                          sx={{ color: estado.ativo !== false ? '#dc3545' : '#28a745' }}
                        >
                          {estado.ativo !== false ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {estadosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {estados.length === 0 
                ? 'Nenhum estado cadastrado' 
                : `Nenhum estado ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
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
            Visualizar Estado
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {estadoSelecionado && (
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
                Dados do Estado
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={estadoSelecionado.ativo !== false}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Nome do Estado e UF */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item sx={{ width: '8%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={estadoSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  disabled
                />
              </Grid>

              <Grid item sx={{ width: '55%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do Estado"
                  value={estadoSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '8%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="UF"
                  value={estadoSelecionado.uf || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 2: País */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '45%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="País"
                  value={paises[estadoSelecionado.paisId] || 'Desconhecido'}
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
                {estadoSelecionado.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(estadoSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {estadoSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(estadoSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
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
          {estadoSelecionado && (
            <Button
              component={Link}
              to={`/estados/editar/${estadoSelecionado.id}`}
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

export default EstadoListMUI;
