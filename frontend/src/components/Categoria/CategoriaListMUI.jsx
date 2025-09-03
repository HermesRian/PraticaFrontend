import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriaModalForm from './CategoriaModalForm';
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
  Add as AddIcon,
  Search as SearchIcon,
  Sell as SellIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const CategoriaListMUI = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/categorias');
      const data = await response.json();
      setCategorias(data);
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCategorias = [...categorias].sort((a, b) => {
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
    setCategorias(sortedCategorias);
  };

  const handleDelete = (id) => {
    const categoria = categorias.find(c => c.id === id);
    const isAtivo = categoria?.ativo;
    const acao = isAtivo ? 'inativar' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja inativar esta categoria?' : 
      'Tem certeza que deseja ativar esta categoria?';
    
    if (window.confirm(mensagem)) {
      if (isAtivo) {
        fetch(`http://localhost:8080/categorias/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setCategorias(categorias.map(categoria => 
              categoria.id === id ? { ...categoria, ativo: false } : categoria
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} categoria:`, error);
            setError(`Erro ao ${acao} categoria`);
          });
      } else {
        const categoriaAtualizada = {
          ...categoria,
          ativo: true,
        };

        fetch(`http://localhost:8080/categorias/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoriaAtualizada),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao ativar categoria');
            }
            return response.json();
          })
          .then(() => {
            setCategorias(categorias.map(categoria => 
              categoria.id === id ? { ...categoria, ativo: true } : categoria
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} categoria:`, error);
            setError(`Erro ao ${acao} categoria`);
          });
      }
    }
  };

  const handleView = async (categoria) => {
    setCategoriaSelecionada(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCategoriaSelecionada(null);
    setIsModalOpen(false);
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    const matchesText = categoria.id?.toString().includes(filtro) ||
      categoria.nome?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && categoria.ativo) ||
      (filtroStatus === 'inativos' && !categoria.ativo);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando categorias...</Typography>
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
        {/* Cabeçalho */}
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
              placeholder="Pesquisar por código, nome..."
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
            Exibindo {categoriasFiltradas.length} de {categorias.length} categorias
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
                    Categoria
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
              {categoriasFiltradas.map((categoria) => (
                <TableRow 
                  key={categoria.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {categoria.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <SellIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {categoria.nome}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={categoria.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={categoria.ativo ? 'success' : 'default'}
                      variant={categoria.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(categoria)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/categorias/editar/${categoria.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={categoria.ativo ? "Inativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(categoria.id)}
                          sx={{ color: categoria.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {categoria.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {categoriasFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {categorias.length === 0 
                ? 'Nenhuma categoria cadastrada' 
                : `Nenhuma categoria ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, minHeight: '40vh' }
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
            Visualizar Categoria
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {categoriaSelecionada && (
          <DialogContent sx={{ p: 4 }}>
            {/* Título e Switch */}
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
                Dados da Categoria
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={categoriaSelecionada.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código e Nome */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={categoriaSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '85%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome da Categoria"
                  value={categoriaSelecionada.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Registros */}
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
                {categoriaSelecionada.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(categoriaSelecionada.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {categoriaSelecionada.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(categoriaSelecionada.ultimaModificacao).toLocaleString('pt-BR')}
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
          {categoriaSelecionada && (
            <Button
              component={Link}
              to={`/categorias/editar/${categoriaSelecionada.id}`}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleCloseModal}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <CategoriaModalForm 
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCategoriaId(null);
        }}
        onSaveSuccess={() => {
          loadData();
          setIsFormModalOpen(false);
          setSelectedCategoriaId(null);
        }}
        categoriaId={selectedCategoriaId}
      />
    </Box>
  );
};

export default CategoriaListMUI;