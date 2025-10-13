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
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const NotaEntradaListMUI = () => {
  const [notasEntrada, setNotasEntrada] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Carregar dados
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/notas-entrada').then(res => res.json()),
      fetch('http://localhost:8080/fornecedores').then(res => res.json())
    ])
    .then(([notasData, fornecedoresData]) => {
      setNotasEntrada(notasData);
      setFornecedores(fornecedoresData);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
      setLoading(false);
    });
  }, []);

  const getFornecedorNome = (fornecedorId) => {
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
    return fornecedor ? fornecedor.nome : 'Não informado';
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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography>Carregando notas de entrada...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Notas de Entrada
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerenciar notas de entrada do sistema
          </Typography>
        </Box>

        {/* Filtros e Botão Adicionar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              variant="outlined"
              placeholder="Pesquisar por número ou fornecedor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
              size="small"
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
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
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Nova Nota
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
                <TableCell sx={{ fontWeight: 600 }}>Data Recebimento</TableCell>
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
                      {getFornecedorNome(nota.fornecedorId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(nota.dataEmissao)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(nota.dataRecebimento)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(nota.totalAPagar)}
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
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/notas-entrada/editar/${nota.id}`}
                        sx={{ color: '#28a745' }}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(nota.id)}
                        sx={{ color: '#dc3545' }}
                        title="Excluir"
                      >
                        <DeleteIcon fontSize="small" />
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
    </Container>
  );
};

export default NotaEntradaListMUI;