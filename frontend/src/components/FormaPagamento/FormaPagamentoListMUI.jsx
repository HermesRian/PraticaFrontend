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
  Payment as PaymentIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const FormaPagamentoListMUI = () => {
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'descricao', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'ativos', 'inativos'
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/formas-pagamento')
      .then(res => res.json())
      .then((data) => {
        setFormasPagamento(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
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

    const sortedFormasPagamento = [...formasPagamento].sort((a, b) => {
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
    setFormasPagamento(sortedFormasPagamento);
  };

  const handleDelete = (id) => {
    const formaPagamento = formasPagamento.find(f => f.id === id);
    const isAtivo = formaPagamento?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir esta forma de pagamento?' : 
      'Tem certeza que deseja ativar esta forma de pagamento?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/formas-pagamento/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status da forma de pagamento na lista local
          setFormasPagamento(formasPagamento.map(forma => 
            forma.id === id ? { ...forma, ativo: !forma.ativo } : forma
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} forma de pagamento:`, error);
          setError(`Erro ao ${acao} forma de pagamento`);
        });
    }
  };

  const handleView = (formaPagamento) => {
    setFormaPagamentoSelecionada(formaPagamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormaPagamentoSelecionada(null);
    setIsModalOpen(false);
  };

  const formasPagamentoFiltradas = formasPagamento.filter(forma => {
    // Filtro por texto (descrição)
    const matchesText = forma.id?.toString().includes(filtro) ||
      forma.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      forma.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
      forma.tipo?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && forma.ativo) ||
      (filtroStatus === 'inativos' && !forma.ativo);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando formas de pagamento...</Typography>
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
              placeholder="Pesquisar por descrição..."
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
            to="/formas-pagamento/cadastrar"
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
            Exibindo {formasPagamentoFiltradas.length} de {formasPagamento.length} formas de pagamento
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
                    active={sortConfig.key === 'descricao'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('descricao')}
                    sx={{ fontWeight: 600 }}
                  >
                    Forma de Pagamento
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
              {formasPagamentoFiltradas.map((forma) => (
                <TableRow 
                  key={forma.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {forma.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <PaymentIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {forma.descricao}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={forma.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={forma.ativo ? 'success' : 'default'}
                      variant={forma.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(forma)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/formas-pagamento/editar/${forma.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={forma.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(forma.id)}
                          sx={{ color: forma.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {forma.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {formasPagamentoFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {formasPagamento.length === 0 
                ? 'Nenhuma forma de pagamento cadastrada' 
                : `Nenhuma forma de pagamento ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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
            Visualizar Forma de Pagamento
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {formaPagamentoSelecionada && (
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
                Dados da Forma de Pagamento
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formaPagamentoSelecionada.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Dados da forma de pagamento */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={formaPagamentoSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descrição"
                  value={formaPagamentoSelecionada.descricao || ''}
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
                {formaPagamentoSelecionada.dataCadastro && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(formaPagamentoSelecionada.dataCadastro).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {formaPagamentoSelecionada.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(formaPagamentoSelecionada.ultimaModificacao).toLocaleString('pt-BR')}
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
          {formaPagamentoSelecionada && (
            <Button
              component={Link}
              to={`/formas-pagamento/editar/${formaPagamentoSelecionada.id}`}
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

export default FormaPagamentoListMUI;
