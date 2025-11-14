import React, { useState, useEffect } from 'react';
import UnidadeMedidaModalForm from './UnidadeMedidaModalForm';
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
  Straighten as StraightenIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const UnidadeMedidaListMUI = () => {
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [unidadeMedidaSelecionada, setUnidadeMedidaSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUnidadeMedidaId, setSelectedUnidadeMedidaId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'

  const loadData = () => {
    fetch('http://localhost:8080/unidades-medida')
      .then(res => res.json())
      .then((data) => {
        setUnidadesMedida(data);
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

    const sortedUnidades = [...unidadesMedida].sort((a, b) => {
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

    setUnidadesMedida(sortedUnidades);
  };

  const unidadesMedidaFiltradas = unidadesMedida.filter((unidade) => {
    const matchFiltro = unidade.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchStatus = 
      filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && unidade.ativo) || 
      (filtroStatus === 'inativos' && !unidade.ativo);
    
    return matchFiltro && matchStatus;
  });

  const handleView = (unidade) => {
    setUnidadeMedidaSelecionada(unidade);
    setIsModalOpen(true);
  };

  const handleEdit = (unidade) => {
    setSelectedUnidadeMedidaId(unidade.id);
    setIsFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUnidadeMedidaId(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir esta unidade de medida?')) {
      fetch(`http://localhost:8080/unidades-medida/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            loadData();
          } else {
            setError('Erro ao excluir unidade de medida');
          }
        })
        .catch((error) => {
          console.error('Erro ao excluir:', error);
          setError('Erro ao excluir unidade de medida');
        });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUnidadeMedidaSelecionada(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedUnidadeMedidaId(null);
    loadData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        {/* cabeçalho top */}
        {/* <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
            <StraightenIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600} color="primary">
              Unidades de Medida
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie as unidades de medida do sistema
            </Typography>
          </Box>
        </Box> */}

        {/* Filtros e Botão Adicionar */}
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
              placeholder="Pesquisar por nome..."
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
            onClick={handleAdd}
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
            Exibindo {unidadesMedidaFiltradas.length} de {unidadesMedida.length} unidades de medida
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
                    Unidade de Medida
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
              {unidadesMedidaFiltradas.map((unidade) => (
                <TableRow 
                  key={unidade.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {unidade.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <StraightenIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {unidade.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={unidade.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={unidade.ativo ? 'success' : 'default'}
                      variant={unidade.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(unidade)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(unidade)}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={unidade.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(unidade.id)}
                          sx={{ color: unidade.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {unidade.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {unidadesMedidaFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {unidadesMedida.length === 0 
                ? 'Nenhuma unidade de medida cadastrada' 
                : `Nenhuma unidade de medida ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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
            Visualizar Unidade de Medida
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {unidadeMedidaSelecionada && (
          <DialogContent sx={{ p: 4 }}>

            {/* Título e switch */}
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
                Dados da Unidade de Medida
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={unidadeMedidaSelecionada.ativo}
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
              <Grid item sx={{ width: '15%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={unidadeMedidaSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '83%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome"
                  value={unidadeMedidaSelecionada.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 2: Observação */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Observação"
                  value={unidadeMedidaSelecionada.observacao || ''}
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
                {unidadeMedidaSelecionada.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(unidadeMedidaSelecionada.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {unidadeMedidaSelecionada.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(unidadeMedidaSelecionada.ultimaModificacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Stack>
            </Box>

          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Formulário */}
      <UnidadeMedidaModalForm
        id={selectedUnidadeMedidaId}
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
      />
    </Box>
  );
};

export default UnidadeMedidaListMUI;
