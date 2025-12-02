import React, { useState, useEffect } from 'react';
import MarcaModalForm from './MarcaModalForm';
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
  LocalOffer as LocalOfferIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const MarcaListMUI = () => {
  const [marcas, setMarcas] = useState([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedMarcaId, setSelectedMarcaId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'

  const loadData = () => {
    fetch('http://localhost:8080/marcas')
      .then(res => res.json())
      .then((data) => {
        setMarcas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados');
        setLoading(false);
      });
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

    const sortedMarcas = [...marcas].sort((a, b) => {
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

    setMarcas(sortedMarcas);
  };

  const handleView = (marca) => {
    setMarcaSelecionada(marca);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedMarcaId(id);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
      fetch(`http://localhost:8080/marcas/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          loadData();
        })
        .catch((error) => {
          console.error('Erro ao excluir marca:', error);
          alert('Erro ao excluir marca');
        });
    }
  };

  const handleAdd = () => {
    setSelectedMarcaId(null);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMarcaSelecionada(null);
  };

  const handleCloseFormModal = (marcaAtualizada) => {
    setIsFormModalOpen(false);
    setSelectedMarcaId(null);
    if (marcaAtualizada) {
      loadData();
    }
  };

  const marcasFiltradas = marcas.filter((marca) => {
    const matchesSearch = 
      marca.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      marca.observacao?.toLowerCase().includes(filtro.toLowerCase()) ||
      marca.id?.toString().includes(filtro);
    
    const matchesStatus = 
      filtroStatus === 'todos' ||
      (filtroStatus === 'ativos' && marca.ativo) ||
      (filtroStatus === 'inativos' && !marca.ativo);

    return matchesSearch && matchesStatus;
  });

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      {/* Cabeçalho */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>
          <LocalOfferIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Marcas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as marcas de produtos
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ height: 'fit-content' }}
        >
          Adicionar
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Pesquisar por nome, observação ou código..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                label="Status"
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativos">Ativos</MenuItem>
                <MenuItem value="inativos">Inativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                <TableSortLabel
                  active={sortConfig.key === 'id'}
                  direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  Código
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                <TableSortLabel
                  active={sortConfig.key === 'nome'}
                  direction={sortConfig.key === 'nome' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('nome')}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Observação</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                <TableSortLabel
                  active={sortConfig.key === 'ativo'}
                  direction={sortConfig.key === 'ativo' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('ativo')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : marcasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {filtro || filtroStatus !== 'todos'
                    ? 'Nenhuma marca encontrada com os filtros aplicados'
                    : 'Nenhuma marca cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              marcasFiltradas.map((marca) => (
                <TableRow 
                  key={marca.id}
                  hover
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    opacity: marca.ativo ? 1 : 0.6
                  }}
                >
                  <TableCell>{marca.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {marca.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {marca.observacao || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={marca.ativo ? <CheckCircleIcon /> : <BlockIcon />}
                      label={marca.ativo ? 'Ativo' : 'Inativo'}
                      color={marca.ativo ? 'success' : 'default'}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        ...(marca.ativo ? {} : { bgcolor: '#e0e0e0' })
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => handleView(marca)}
                        sx={{ color: '#1976d2' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(marca.id)}
                        sx={{ color: '#ed6c02' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(marca.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rodapé */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {marcasFiltradas.length} marca{marcasFiltradas.length !== 1 ? 's' : ''}
          {filtro || filtroStatus !== 'todos' ? ` (filtrado de ${marcas.length})` : ''}
        </Typography>
      </Box>

      {/* Modal de Visualização */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
            <Typography variant="h6" component="span">
              Detalhes da Marca
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={marcaSelecionada?.ativo || false}
                  disabled
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {marcaSelecionada?.ativo ? 'Ativa' : 'Inativa'}
                </Typography>
              }
            />
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseModal}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {marcaSelecionada && (
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Código"
                  value={marcaSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={marcaSelecionada.nome || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observação"
                  value={marcaSelecionada.observacao || ''}
                  InputProps={{ readOnly: true }}
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Data de Criação:</strong> {formatarData(marcaSelecionada.dataCriacao)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Última Modificação:</strong> {formatarData(marcaSelecionada.ultimaModificacao)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Formulário */}
      <MarcaModalForm
        id={selectedMarcaId}
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
      />
    </Box>
  );
};

export default MarcaListMUI;
