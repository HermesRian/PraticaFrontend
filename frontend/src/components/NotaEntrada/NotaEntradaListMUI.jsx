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
  TableSortLabel,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const NotaEntradaListMUI = () => {
  const [notasEntrada, setNotasEntrada] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'numero', direction: 'desc' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [notasData, fornecedoresData] = await Promise.all([
        fetch('http://localhost:8080/notas-entrada').then(res => res.json()),
        fetch('http://localhost:8080/fornecedores').then(res => res.json())
      ]);
      console.log('Notas carregadas:', notasData);
      console.log('Fornecedores carregados:', fornecedoresData);
      setNotasEntrada(notasData);
      setFornecedores(fornecedoresData);
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

    const sortedNotas = [...notasEntrada].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'fornecedor') {
        aValue = getFornecedorNome(a);
        bValue = getFornecedorNome(b);
      }

      if (key === 'dataEmissao' || key === 'dataRecebimento') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
    setNotasEntrada(sortedNotas);
  };

  const getFornecedorNome = (nota) => {
    // Tenta pegar do objeto fornecedor aninhado primeiro
    if (nota.fornecedor) {
      return nota.fornecedor.nomeFantasia || nota.fornecedor.razaoSocial || 'Nome não informado';
    }
    
    // Fallback: busca na lista de fornecedores usando o ID
    if (nota.fornecedorId) {
      const fornecedor = fornecedores.find((f) => f.id === nota.fornecedorId);
      if (fornecedor) {
        return fornecedor.nomeFantasia || fornecedor.razaoSocial || fornecedor.nome || 'Nome não informado';
      }
    }
    
    return 'Fornecedor não informado';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning';
      case 'RECEBIDA':
        return 'success';
      case 'PARCIALMENTE_RECEBIDA':
        return 'info';
      case 'CANCELADA':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'RECEBIDA':
        return 'Recebida';
      case 'PARCIALMENTE_RECEBIDA':
        return 'Parcial';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota de entrada?')) {
      fetch(`http://localhost:8080/notas-entrada/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setNotasEntrada(notasEntrada.filter(nota => nota.id !== id));
        })
        .catch((error) => {
          console.error('Erro ao excluir nota:', error);
          setError('Erro ao excluir nota de entrada');
        });
    }
  };

  const notasFiltradas = notasEntrada.filter(nota => {
    // Filtro por texto
    const matchesText = nota.numero?.toLowerCase().includes(filtro.toLowerCase()) ||
      getFornecedorNome(nota.fornecedorId)?.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || nota.status === filtroStatus;
    
    return matchesText && matchesStatus;
  });

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

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
        <Typography>Carregando notas de entrada...</Typography>
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
              placeholder="Pesquisar por número, fornecedor..."
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
                <MenuItem value="RECEBIDA">Recebida</MenuItem>
                <MenuItem value="PARCIALMENTE_RECEBIDA">Parcial</MenuItem>
                <MenuItem value="CANCELADA">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            component={Link}
            to="/notas-entrada/cadastrar"
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

        {/* Contador */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Exibindo {notasFiltradas.length} de {notasEntrada.length} notas de entrada
          </Typography>
        </Box>

        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Número</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fornecedor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data Emissão</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notasFiltradas.map((nota) => (
                <TableRow 
                  key={nota.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {nota.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getFornecedorNome(nota)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(nota.dataEmissao)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(nota.valorTotal || nota.totalAPagar || nota.total || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(nota.status)}
                      size="small"
                      color={getStatusColor(nota.status)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: '#1976d2' }}
                        title="Visualizar"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mensagem quando não há dados */}
        {notasFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {notasEntrada.length === 0 
                ? 'Nenhuma nota de entrada cadastrada' 
                : 'Nenhuma nota encontrada com os filtros aplicados'
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
    </Box>
  );
};

export default NotaEntradaListMUI;