import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CidadeModalForm from './CidadeModalForm';
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
  LocationCity as LocationCityIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const CidadeListMUI = () => {
  const [cidades, setCidades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCidadeId, setSelectedCidadeId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cidadesData, estadosData] = await Promise.all([
        fetch('http://localhost:8080/cidades').then(res => res.json()),
        fetch('http://localhost:8080/estados').then(res => res.json()).catch(() => [])
      ]);
      setCidades(cidadesData);
      setEstados(estadosData);
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

  const getEstadoNome = (estadoId) => {
    const estado = estados.find((e) => e.id === estadoId);
    return estado ? `${estado.nome} - ${estado.uf}` : 'Não informado';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCidades = [...cidades].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'estado') {
        aValue = getEstadoNome(a.estadoId);
        bValue = getEstadoNome(b.estadoId);
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
    const acao = isAtivo ? 'inativar' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja inativar esta cidade?' : 
      'Tem certeza que deseja ativar esta cidade?';
    
    if (window.confirm(mensagem)) {
      if (isAtivo) {
        fetch(`http://localhost:8080/cidades/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setCidades(cidades.map(cidade => 
              cidade.id === id ? { ...cidade, ativo: false } : cidade
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} cidade:`, error);
            setError(`Erro ao ${acao} cidade`);
          });
      } else {
        const cidadeAtualizada = {
          ...cidade,
          ativo: true,
        };

        fetch(`http://localhost:8080/cidades/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cidadeAtualizada),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao ativar cidade');
            }
            return response.json();
          })
          .then(() => {
            setCidades(cidades.map(cidade => 
              cidade.id === id ? { ...cidade, ativo: true } : cidade
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} cidade:`, error);
            setError(`Erro ao ${acao} cidade`);
          });
      }
    }
  };

  const handleView = async (cidade) => {
    let cidadeComEstado = { ...cidade };
    
    if (cidade.estadoId) {
      try {
        const estadoResponse = await fetch(`http://localhost:8080/estados/${cidade.estadoId}`);
        if (estadoResponse.ok) {
          const estadoData = await estadoResponse.json();
          cidadeComEstado.estadoDescricao = `${estadoData.nome} - ${estadoData.uf}`;
        } else {
          cidadeComEstado.estadoDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar estado:', error);
        cidadeComEstado.estadoDescricao = 'Erro ao carregar';
      }
    }
    
    setCidadeSelecionada(cidadeComEstado);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCidadeId(id);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setCidadeSelecionada(null);
    setIsModalOpen(false);
  };

  const cidadesFiltradas = cidades.filter(cidade => {
    const matchesText = cidade.id?.toString().includes(filtro) ||
      cidade.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cidade.codigoIbge?.toLowerCase().includes(filtro.toLowerCase()) ||
      cidade.ddd?.toString().includes(filtro) ||
      getEstadoNome(cidade.estadoId)?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && cidade.ativo) ||
      (filtroStatus === 'inativos' && !cidade.ativo);
    
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
              placeholder="Pesquisar por código, nome, IBGE, DDD, estado..."
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
                    Cidade
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
                    active={sortConfig.key === 'ddd'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('ddd')}
                    sx={{ fontWeight: 600 }}
                  >
                    DDD
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
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {cidade.nome}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cidade.codigoIbge || 'N/A'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cidade.ddd || 'N/A'}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getEstadoNome(cidade.estadoId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cidade.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={cidade.ativo ? 'success' : 'default'}
                      variant={cidade.ativo ? 'filled' : 'outlined'}
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
                          onClick={() => handleEdit(cidade.id)}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={cidade.ativo ? "Inativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cidade.id)}
                          sx={{ color: cidade.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {cidade.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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
            Visualizar Cidade
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {cidadeSelecionada && (
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
                Dados da Cidade
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cidadeSelecionada.ativo}
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
                  value={cidadeSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '85%' }}>
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

            {/* Linha 2: Código IBGE, DDD e Estado */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
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
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="DDD"
                  value={cidadeSelecionada.ddd || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '60%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estado"
                  value={cidadeSelecionada.estadoDescricao || getEstadoNome(cidadeSelecionada.estadoId)}
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
                {cidadeSelecionada.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(cidadeSelecionada.dataCriacao).toLocaleString('pt-BR')}
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
              onClick={() => {
                handleEdit(cidadeSelecionada.id);
                handleCloseModal();
              }}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <CidadeModalForm 
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCidadeId(null);
        }}
        onSaveSuccess={() => {
          loadData();
          setIsFormModalOpen(false);
          setSelectedCidadeId(null);
        }}
        cidadeId={selectedCidadeId}
      />
    </Box>
  );
};

export default CidadeListMUI;