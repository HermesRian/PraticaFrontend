import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import ProdutoModalForm from './ProdutoModalForm';

const ProdutoList = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/produtos');
      const data = await response.json();
      setProdutos(data);
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
  };

  const handleDelete = (id) => {
    const produto = produtos.find(p => p.id === id);
    setProdutoToDelete(produto);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (produtoToDelete) {
      fetch(`http://localhost:8080/produtos/\${produtoToDelete.id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao excluir produto');
          }
          loadData();
          setDeleteDialogOpen(false);
          setProdutoToDelete(null);
        })
        .catch(error => {
          console.error('Erro:', error);
          setError('Erro ao excluir produto');
        });
    }
  };

  const handleView = async (produto) => {
    setProdutoSelecionado(produto);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedProdutoId(id);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProdutoSelecionado(null);
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchesFiltro = produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
                         produto.descricao.toLowerCase().includes(filtro.toLowerCase());
    
    if (filtroStatus === 'todos') return matchesFiltro;
    if (filtroStatus === 'ativos') return matchesFiltro && produto.ativo;
    if (filtroStatus === 'inativos') return matchesFiltro && !produto.ativo;
    return matchesFiltro;
  });

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ color: '#364152' }}>
            Produtos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar produto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={filtroStatus === 'ativos'}
                  onChange={(e) => setFiltroStatus(e.target.checked ? 'ativos' : 'todos')}
                  color="primary"
                />
              }
              label={<Typography variant="body2">Apenas ativos</Typography>}
            />

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
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('codigo')}
                  style={{ cursor: 'pointer', width: '10%' }}
                >
                  Código
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('nome')}
                  style={{ cursor: 'pointer', width: '25%' }}
                >
                  Nome
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('preco')}
                  style={{ cursor: 'pointer', width: '15%' }}
                >
                  Preço
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('quantidadeEstoque')}
                  style={{ cursor: 'pointer', width: '15%' }}
                >
                  Estoque
                </TableCell>
                <TableCell 
                  style={{ width: '20%' }}
                >
                  Descrição
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('ativo')}
                  style={{ cursor: 'pointer', width: '5%' }}
                >
                  Status
                </TableCell>
                <TableCell style={{ width: '10%' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosOrdenados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.codigo}</TableCell>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(produto.preco)}
                  </TableCell>
                  <TableCell>{produto.quantidadeEstoque}</TableCell>
                  <TableCell>{produto.descricao}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: produto.ativo ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(produto)}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(produto.id)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(produto.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={produtosOrdenados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o produto "{produtoToDelete?.nome}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do Produto</DialogTitle>
        <DialogContent>
          {produtoSelecionado && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Código:</strong> {produtoSelecionado.codigo}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Nome:</strong> {produtoSelecionado.nome}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Preço:</strong> {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(produtoSelecionado.preco)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Quantidade em Estoque:</strong> {produtoSelecionado.quantidadeEstoque}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Descrição:</strong> {produtoSelecionado.descricao}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {produtoSelecionado.ativo ? 'Ativo' : 'Inativo'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <ProdutoModalForm 
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProdutoId(null);
        }}
        onSaveSuccess={() => {
          loadData();
          setIsFormModalOpen(false);
          setSelectedProdutoId(null);
        }}
        produtoId={selectedProdutoId}
      />
    </Box>
  );
};

export default ProdutoList;
