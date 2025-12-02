import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ClienteModal = ({ open, onClose, onSelect, onAddNew, refreshTrigger }) => {
  const [clientes, setClientes] = useState([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega clientes e condições de pagamento quando o modal abre
  useEffect(() => {
    if (open) {
      carregarClientes();
      carregarCondicoesPagamento();
    }
  }, [open]);

  // Recarrega clientes quando refreshTrigger muda (novo cliente cadastrado)
  useEffect(() => {
    if (refreshTrigger > 0) {
      carregarClientes();
    }
  }, [refreshTrigger]);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clientes');
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarCondicoesPagamento = async () => {
    try {
      const response = await fetch('http://localhost:8080/condicoes-pagamento');
      if (response.ok) {
        const data = await response.json();
        setCondicoesPagamento(data);
      }
    } catch (error) {
      console.error('Erro ao carregar condições de pagamento:', error);
    }
  };

  const getCondicaoPagamentoNome = (condicaoId) => {
    if (!condicaoId) return 'Não informada';
    const condicao = condicoesPagamento.find(c => c.id === condicaoId);
    return condicao ? condicao.nome : 'Não informada';
  };

  const handleSelect = (cliente) => {
    onSelect(cliente);
    onClose();
    setFiltro('');
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.apelido?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.razaoSocial?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.nomeFantasia?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cnpjCpf?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpfCnpj?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f5f5f5', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        fontWeight: 600
      }}>
        Selecionar Cliente
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Campo de busca */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar por nome, apelido, razão social, nome fantasia ou CPF/CNPJ..."
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
              '& .MuiOutlinedInput-root': {
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
        </Box>

        {/* Contador de resultados e botão adicionar */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Carregando...' : `${clientesFiltrados.length} cliente(s) encontrado(s)`}
          </Typography>
          {onAddNew && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                px: 2,
                py: 0.5
              }}
            >
              Adicionar
            </Button>
          )}
        </Box>

        {/* Tabela de clientes */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Nome / Razão Social</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Apelido / Nome Fantasia</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>CPF/CNPJ</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Condição Pagamento</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa', width: 100 }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow 
                  key={cliente.id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                  onClick={() => handleSelect(cliente)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {cliente.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {cliente.razaoSocial || cliente.nome || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cliente.nomeFantasia || cliente.apelido || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {cliente.cnpjCpf || cliente.cpfCnpj || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCondicaoPagamentoNome(cliente.condicaoPagamentoId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cliente.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={cliente.ativo ? 'success' : 'default'}
                      variant={cliente.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(cliente);
                      }}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        bgcolor: '#28a745',
                        '&:hover': { bgcolor: '#218838' }
                      }}
                    >
                      Selecionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {clientesFiltrados.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {filtro ? 'Nenhum cliente encontrado com o filtro aplicado' : 'Nenhum cliente cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteModal;
