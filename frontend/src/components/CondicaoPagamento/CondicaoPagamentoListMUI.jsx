import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CondicaoPagamentoModalForm from './CondicaoPagamentoModalForm';
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
  Payment as PaymentIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

const CondicaoPagamentoListMUI = () => {
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [condicaoSelecionada, setCondicaoSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCondicaoPagamentoId, setSelectedCondicaoPagamentoId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCondicoes = [...condicoesPagamento].sort((a, b) => {
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
    setCondicoesPagamento(sortedCondicoes);
  };

  const handleDelete = (id) => {
    const condicao = condicoesPagamento.find(c => c.id === id);
    const isAtivo = condicao?.ativo;
    const acao = isAtivo ? 'excluir' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja excluir esta condição de pagamento?' : 
      'Tem certeza que deseja ativar esta condição de pagamento?';
    
    if (window.confirm(mensagem)) {
      fetch(`http://localhost:8080/condicoes-pagamento/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          // Atualiza o status da condição na lista local
          setCondicoesPagamento(condicoesPagamento.map(condicao => 
            condicao.id === id ? { ...condicao, ativo: !condicao.ativo } : condicao
          ));
        })
        .catch((error) => {
          console.error(`Erro ao ${acao} condição de pagamento:`, error);
          setError(`Erro ao ${acao} condição de pagamento`);
        });
    }
  };

  const handleView = async (condicao) => {
    setCondicaoSelecionada(condicao);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCondicaoSelecionada(null);
    setIsModalOpen(false);
  };

  const handleEdit = (id) => {
    setSelectedCondicaoPagamentoId(id);
    setIsFormModalOpen(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/condicoes-pagamento');
      const data = await response.json();
      setCondicoesPagamento(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular soma dos percentuais das parcelas
  const calcularSomaPercentuais = (parcelas) => {
    if (!parcelas || parcelas.length === 0) return 0;
    return parcelas.reduce((soma, parcela) => soma + parseFloat(parcela.percentual || 0), 0);
  };

  const condicoesFiltradas = condicoesPagamento.filter(condicao => {
    // Filtro por texto (código, descrição)
    const matchesText = condicao.id?.toString().includes(filtro) ||
      condicao.nome?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && condicao.ativo) ||
      (filtroStatus === 'inativos' && !condicao.ativo);
    
    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando condições de pagamento...</Typography>
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
              placeholder="Pesquisar por código ou descrição..."
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
            Exibindo {condicoesFiltradas.length} de {condicoesPagamento.length} condições de pagamento
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
                    Descrição
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'dias'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('dias')}
                    sx={{ fontWeight: 600 }}
                  >
                    Prazo (dias)
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'parcelas'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('parcelas')}
                    sx={{ fontWeight: 600 }}
                  >
                    Parcelas
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  Percentuais
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
              {condicoesFiltradas.map((condicao) => (
                <TableRow 
                  key={condicao.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {condicao.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <PaymentIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {condicao.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<ScheduleIcon />}
                      label={`${condicao.dias} dias`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<ReceiptIcon />}
                      label={`${condicao.parcelasCondicao?.length || 0}x`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {condicao.jurosPercentual > 0 && (
                        <Chip label={`J: ${condicao.jurosPercentual}%`} size="small" color="warning" variant="outlined" />
                      )}
                      {condicao.multaPercentual > 0 && (
                        <Chip label={`M: ${condicao.multaPercentual}%`} size="small" color="error" variant="outlined" />
                      )}
                      {condicao.descontoPercentual > 0 && (
                        <Chip label={`D: ${condicao.descontoPercentual}%`} size="small" color="success" variant="outlined" />
                      )}
                      {condicao.jurosPercentual === 0 && condicao.multaPercentual === 0 && condicao.descontoPercentual === 0 && (
                        <Typography variant="caption" color="text.secondary">Nenhum</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={condicao.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={condicao.ativo ? 'success' : 'default'}
                      variant={condicao.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(condicao)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(condicao.id)}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={condicao.ativo ? "Excluir" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(condicao.id)}
                          sx={{ color: condicao.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {condicao.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {condicoesFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {condicoesPagamento.length === 0 
                ? 'Nenhuma condição de pagamento cadastrada' 
                : `Nenhuma condição de pagamento ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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
            Visualizar Condição de Pagamento
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {condicaoSelecionada && (
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
                Dados da Condição de Pagamento
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={condicaoSelecionada.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Descrição, Dias */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '8%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={condicaoSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  disabled
                />
              </Grid>

              <Grid item sx={{ width: '62%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descrição"
                  value={condicaoSelecionada.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Prazo (dias)"
                  value={condicaoSelecionada.dias || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                {/* Espaço vazio para manter alinhamento */}
              </Grid>
            </Grid>

            {/* Linha 2: Percentuais */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Juros (%)"
                  value={condicaoSelecionada.jurosPercentual || 0}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Multa (%)"
                  value={condicaoSelecionada.multaPercentual || 0}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Desconto (%)"
                  value={condicaoSelecionada.descontoPercentual || 0}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                {/* Espaço vazio para manter alinhamento */}
              </Grid>
            </Grid>

            {/* Seção de Parcelas */}
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              Parcelas
            </Typography>

            {/* Informações das Parcelas */}
            {condicaoSelecionada.parcelasCondicao && condicaoSelecionada.parcelasCondicao.length > 0 && (
              <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Número de Parcelas"
                    value={condicaoSelecionada.parcelasCondicao.length}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  {/* Espaço para manter alinhamento */}
                </Grid>
                <Grid item xs={6} md={3}>
                  {/* Espaço para manter alinhamento */}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalculateIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Soma: {calcularSomaPercentuais(condicaoSelecionada.parcelasCondicao).toFixed(2)}%
                    </Typography>
                    <Chip 
                      label={Math.abs(calcularSomaPercentuais(condicaoSelecionada.parcelasCondicao) - 100) < 0.01 ? "✓ 100%" : "≠ 100%"}
                      size="small"
                      color={Math.abs(calcularSomaPercentuais(condicaoSelecionada.parcelasCondicao) - 100) < 0.01 ? "success" : "error"}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {/* Lista de Parcelas */}
            {condicaoSelecionada.parcelasCondicao && condicaoSelecionada.parcelasCondicao.length > 0 ? (
              condicaoSelecionada.parcelasCondicao.map((parcela, index) => (
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} key={index}>
                  <Grid item xs={6} md={1.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nº"
                      value={parcela.numeroParcela}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Dias"
                      value={parcela.dias}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Percentual (%)"
                      value={parcela.percentual}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item sx={{ width: '30%' }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Forma de Pagamento"
                      value={parcela.formaPagamento?.nome || 'Não informada'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    {/* Espaço vazio para manter alinhamento */}
                  </Grid>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Nenhuma parcela cadastrada
              </Typography>
            )}

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
                {condicaoSelecionada.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(condicaoSelecionada.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {condicaoSelecionada.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(condicaoSelecionada.ultimaModificacao).toLocaleString('pt-BR')}
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
          {condicaoSelecionada && (
            <Button
              onClick={() => {
                handleEdit(condicaoSelecionada.id);
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

      <CondicaoPagamentoModalForm 
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCondicaoPagamentoId(null);
        }}
        onSaveSuccess={() => {
          loadData();
          setIsFormModalOpen(false);
          setSelectedCondicaoPagamentoId(null);
        }}
        condicaoPagamentoId={selectedCondicaoPagamentoId}
      />
    </Box>
  );
};

export default CondicaoPagamentoListMUI;
