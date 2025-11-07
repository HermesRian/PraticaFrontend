import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ContaPagarListMUI = () => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  useEffect(() => {
    carregarContas();
  }, []);

  const carregarContas = async () => {
    try {
      const response = await fetch('http://localhost:8080/contas-pagar');
      if (response.ok) {
        const data = await response.json();
        setContas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/contas-pagar/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContaSelecionada(data);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da conta:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setContaSelecionada(null);
  };

  const handlePagar = async (id) => {
    if (window.confirm('Tem certeza que deseja marcar esta conta como paga?')) {
      try {
        const response = await fetch(`http://localhost:8080/contas-pagar/${id}/pagar`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          carregarContas();
          alert('Conta marcada como paga com sucesso!');
        } else {
          const errorText = await response.text();
          console.error('Erro ao pagar conta:', response.status, errorText);
          alert(`Erro ao marcar conta como paga: ${errorText || response.status}`);
        }
      } catch (error) {
        console.error('Erro ao pagar conta:', error);
        alert('Erro ao marcar conta como paga');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning';
      case 'PAGA':
        return 'success';
      case 'VENCIDA':
        return 'error';
      case 'CANCELADA':
        return 'default';
      case 'PARCIALMENTE_PAGA':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'PAGA':
        return 'Paga';
      case 'VENCIDA':
        return 'Vencida';
      case 'CANCELADA':
        return 'Cancelada';
      case 'PARCIALMENTE_PAGA':
        return 'Parcial';
      default:
        return status;
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const calcularValorTotal = (conta) => {
    const valor = conta.valor || 0;
    const desconto = conta.desconto || 0;
    const multa = conta.multa || 0;
    const juro = conta.juro || 0;
    return valor - desconto + multa + juro;
  };

  const isVencida = (conta) => {
    if (conta.status === 'PAGA' || conta.status === 'CANCELADA') return false;
    const hoje = new Date();
    const vencimento = new Date(conta.dataVencimento);
    return vencimento < hoje;
  };

  const contasFiltradas = contas.filter(conta => {
    const matchesText = 
      conta.numero?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.id?.toString().includes(filtro);

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;

    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ 
        padding: { xs: 2, md: 3 }, 
        bgcolor: '#f8f9fa', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography>Carregando contas a pagar...</Typography>
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
        {/* Cabeçalho com filtros */}
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
              placeholder="Pesquisar por número, descrição..."
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
                sx={{ height: 40 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="PENDENTE">Pendente</MenuItem>
                <MenuItem value="PAGA">Paga</MenuItem>
                <MenuItem value="VENCIDA">Vencida</MenuItem>
                <MenuItem value="CANCELADA">Cancelada</MenuItem>
                <MenuItem value="PARCIALMENTE_PAGA">Parcial</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            component={Link}
            to="/contas-pagar/cadastrar"
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

        {/* Tabela */}
        <TableContainer sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Número</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Parcela</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 180 }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {filtro || filtroStatus !== 'todos' 
                        ? 'Nenhuma conta encontrada com os filtros aplicados' 
                        : 'Nenhuma conta a pagar cadastrada'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contasFiltradas.map((conta) => (
                  <TableRow 
                    key={conta.id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f8f9fa' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {conta.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {conta.descricao || 'Sem descrição'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" align="center">
                        {conta.parcela}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatarData(conta.dataVencimento)}
                      </Typography>
                      {isVencida(conta) && (
                        <Chip 
                          label="VENCIDA" 
                          size="small" 
                          color="error" 
                          sx={{ mt: 0.5, fontSize: '0.65rem' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatarValor(calcularValorTotal(conta))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(conta.status)}
                        size="small"
                        color={getStatusColor(conta.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Visualizar">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleView(conta.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {conta.status === 'PENDENTE' && (
                          <Tooltip title="Pagar">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handlePagar(conta.id)}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Resumo */}
        {contasFiltradas.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total de {contasFiltradas.length} conta(s)
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                Total: {formatarValor(contasFiltradas.reduce((sum, conta) => sum + calcularValorTotal(conta), 0))}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Modal de Visualização */}
      <Dialog
        open={modalOpen}
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
            Visualizar Conta a Pagar
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {contaSelecionada && (
          <DialogContent sx={{ p: 4 }}>
            {/* Cabeçalho com título */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              mb: 4 
            }}>
              <Typography 
                variant="h5" 
                component="h1" 
                align="center" 
                sx={{ color: '#333', fontWeight: 600 }}
              >
                Dados da Conta a Pagar
              </Typography>
            </Box>

            {/* Informações da Conta */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '12%' }}>
                <TextField
                  fullWidth
                  label="Código"
                  value={contaSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '12%' }}>
                <TextField
                  fullWidth
                  label="Parcela"
                  value={contaSelecionada.parcela || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '18%' }}>
                <TextField
                  fullWidth
                  label="Status"
                  value={getStatusLabel(contaSelecionada.status)}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '18%' }}>
                <TextField
                  fullWidth
                  label="Valor"
                  value={formatarValor(contaSelecionada.valor)}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                  sx={{ '& .MuiInputBase-input': { fontWeight: 600 } }}
                />
              </Grid>

              <Grid item sx={{ width: '18%' }}>
                <TextField
                  fullWidth
                  label="Data Vencimento"
                  value={formatarData(contaSelecionada.dataVencimento)}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '18%' }}>
                <TextField
                  fullWidth
                  label="Data Pagamento"
                  value={contaSelecionada.dataPagamento ? formatarData(contaSelecionada.dataPagamento) : 'Não paga'}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={contaSelecionada.descricao || ''}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            {contaSelecionada.justificativaCancelamento && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Justificativa de Cancelamento"
                    value={contaSelecionada.justificativaCancelamento}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContaPagarListMUI;
