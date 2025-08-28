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
  Public as PublicIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const PaisListMUI = () => {
  const [paises, setPaises] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/paises')
      .then((response) => response.json())
      .then((data) => {
        // Temporariamente, exibe todos os países como ativos até o backend ser corrigido
        const paisesNormalizados = data.map(pais => ({
          ...pais,
          ativo: true // Força todos como ativos
        }));
        
        setPaises(paisesNormalizados);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar países:', error);
        setError('Erro ao carregar dados');
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedPaises = [...paises].sort((a, b) => {
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
    setPaises(sortedPaises);
  };

  const handleDelete = (id) => {
    const pais = paises.find(p => p.id === id);
    const isAtivo = pais?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir este país?' : 
      'Tem certeza que deseja ativar este país?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/paises/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status do país na lista local
          setPaises(paises.map(pais => 
            pais.id === id ? { ...pais, ativo: !pais.ativo } : pais
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} país:`, error);
          setError(`Erro ao ${acao} país`);
        });
    }
  };

  const handleView = async (pais) => {
    setPaisSelecionado(pais);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPaisSelecionado(null);
    setIsModalOpen(false);
  };

  const paisesFiltrados = paises.filter(pais => {
    // Filtro por texto (código, nome, sigla)
    const matchesText = pais.id?.toString().includes(filtro) ||
      pais.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      pais.sigla?.toLowerCase().includes(filtro.toLowerCase()) ||
      pais.codigo?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && pais.ativo) ||
      (filtroStatus === 'inativos' && !pais.ativo);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando países...</Typography>
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
              placeholder="Pesquisar por código, nome, sigla ou DDI..."
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
            to="/paises/cadastrar"
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
            Exibindo {paisesFiltrados.length} de {paises.length} países
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
                    active={sortConfig.key === 'sigla'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('sigla')}
                    sx={{ fontWeight: 600 }}
                  >
                    Sigla
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'codigo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('codigo')}
                    sx={{ fontWeight: 600 }}
                  >
                    DDI
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
              {paisesFiltrados.map((pais) => (
                <TableRow 
                  key={pais.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {pais.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <PublicIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {pais.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pais.sigla}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pais.codigo}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pais.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={pais.ativo ? 'success' : 'default'}
                      variant={pais.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(pais)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/paises/editar/${pais.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={pais.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(pais.id)}
                          sx={{ color: pais.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {pais.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {paisesFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {paises.length === 0 
                ? 'Nenhum país cadastrado' 
                : `Nenhum país ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
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
            Visualizar País
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {paisSelecionado && (
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
                Dados do País
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paisSelecionado.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Nome, Sigla, Código do País */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '8%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={paisSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  disabled
                />
              </Grid>

              <Grid item sx={{ width: '62%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do País"
                  value={paisSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sigla"
                  value={paisSelecionado.sigla || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="DDI"
                  value={paisSelecionado.codigo || ''}
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
                {paisSelecionado.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(paisSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {paisSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(paisSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
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
          {paisSelecionado && (
            <Button
              component={Link}
              to={`/paises/editar/${paisSelecionado.id}`}
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

export default PaisListMUI;
