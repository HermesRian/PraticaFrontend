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
  LocationCity as LocationCityIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const CidadeListMUI = () => {
  const [cidades, setCidades] = useState([]);
  const [estados, setEstados] = useState({});
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar cidades
    fetch('http://localhost:8080/cidades')
      .then((response) => response.json())
      .then((data) => {
        setCidades(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar cidades:', error);
        setError('Erro ao carregar dados das cidades');
        setLoading(false);
      });

    // Buscar estados para exibir os nomes
    fetch('http://localhost:8080/estados')
      .then((response) => response.json())
      .then((data) => {
        const estadosMap = {};
        data.forEach((estado) => {
          estadosMap[estado.id] = `${estado.nome} - ${estado.uf}`;
        });
        setEstados(estadosMap);
      })
      .catch((error) => {
        console.error('Erro ao buscar estados:', error);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCidades = [...cidades].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para a coluna "estado", usamos o nome do estado
      if (key === 'estado') {
        aValue = estados[a.estadoId] || 'Desconhecido';
        bValue = estados[b.estadoId] || 'Desconhecido';
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
    setCidades(sortedCidades);
  };

  const handleDelete = (id) => {
    const cidade = cidades.find(c => c.id === id);
    const isAtivo = cidade?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir esta cidade?' : 
      'Tem certeza que deseja ativar esta cidade?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/cidades/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Remove completamente da lista
          setCidades(cidades.filter(cidade => cidade.id !== id));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} cidade:`, error);
          setError(`Erro ao ${acao} cidade`);
        });
    }
  };

  const handleView = async (cidade) => {
    setCidadeSelecionada(cidade);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCidadeSelecionada(null);
    setIsModalOpen(false);
  };

  const cidadesFiltradas = cidades.filter(cidade => {
    // Filtro por texto (código, nome, código IBGE, estado)
    const estadoNome = estados[cidade.estadoId] || '';
    const matchesText = cidade.id?.toString().includes(filtro) ||
      cidade.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cidade.codigoIbge?.toString().includes(filtro) ||
      estadoNome.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && cidade.ativo !== false) ||
      (filtroStatus === 'inativos' && cidade.ativo === false);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando cidades...</Typography>
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
              placeholder="Pesquisar por código, nome, IBGE ou estado..."
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
            to="/cidades/cadastrar"
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
            Exibindo {cidadesFiltradas.length} de {cidades.length} cidades
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
                    active={sortConfig.key === 'codigoIbge'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('codigoIbge')}
                    sx={{ fontWeight: 600 }}
                  >
                    Código IBGE
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'estado'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('estado')}
                    sx={{ fontWeight: 600 }}
                  >
                    Estado
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
              {cidadesFiltradas.map((cidade) => (
                <TableRow 
                  key={cidade.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {cidade.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <LocationCityIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {cidade.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cidade.codigoIbge}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {estados[cidade.estadoId] || 'Desconhecido'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cidade.ativo !== false ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={cidade.ativo !== false ? 'success' : 'default'}
                      variant={cidade.ativo !== false ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(cidade)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/cidades/editar/${cidade.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={cidade.ativo !== false ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cidade.id)}
                          sx={{ color: cidade.ativo !== false ? '#dc3545' : '#28a745' }}
                        >
                          {cidade.ativo !== false ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {cidadesFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {cidades.length === 0 
                ? 'Nenhuma cidade cadastrada' 
                : `Nenhuma cidade ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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
            Visualizar Cidade
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {cidadeSelecionada && (
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
                Dados da Cidade
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cidadeSelecionada.ativo !== false}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código e Nome da Cidade */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item sx={{ width: '8%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={cidadeSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  disabled
                />
              </Grid>

              <Grid item sx={{ width: '65%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome da Cidade"
                  value={cidadeSelecionada.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 2: Código IBGE e Estado */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código IBGE"
                  value={cidadeSelecionada.codigoIbge || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '50%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estado"
                  value={estados[cidadeSelecionada.estadoId] || 'Desconhecido'}
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
                {cidadeSelecionada.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(cidadeSelecionada.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {cidadeSelecionada.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(cidadeSelecionada.ultimaModificacao).toLocaleString('pt-BR')}
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
          {cidadeSelecionada && (
            <Button
              component={Link}
              to={`/cidades/editar/${cidadeSelecionada.id}`}
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

export default CidadeListMUI;
