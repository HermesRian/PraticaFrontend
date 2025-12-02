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

const ProdutoModal = ({ open, onClose, onSelect, onAddNew, refreshTrigger }) => {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Carrega dados quando o modal abre
  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  // Recarrega produtos quando refreshTrigger muda (novo produto cadastrado)
  useEffect(() => {
    if (refreshTrigger > 0) {
      carregarDados();
    }
  }, [refreshTrigger]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [produtosRes, categoriasRes] = await Promise.all([
        fetch('http://localhost:8080/produtos'),
        fetch('http://localhost:8080/categorias')
      ]);

      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setProdutos(produtosData);
      }

      if (categoriasRes.ok) {
        const categoriasData = await categoriasRes.json();
        setCategorias(categoriasData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSelect = (produto) => {
    onSelect(produto);
    onClose();
    setFiltro('');
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.id?.toString().includes(filtro)
  );

  // Função helper para buscar nome da categoria
  const getCategoriaNome = (categoriaId) => {
    if (!categoriaId || !categorias.length) return 'Sem categoria';
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nome : 'Sem categoria';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
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
        pb: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          Selecionar Produto
        </Typography>
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
            placeholder="Pesquisar por código, nome ou ID do produto..."
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
            {loading ? 'Carregando...' : `${produtosFiltrados.length} produto(s) encontrado(s)`}
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

        {/* Tabela de produtos */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Estoque</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa', width: 100 }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow 
                  key={produto.id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                  onClick={() => handleSelect(produto)}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                      {produto.id || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {produto.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCategoriaNome(produto.categoriaId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {produto.quantidadeEstoque || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={produto.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={produto.ativo ? 'success' : 'default'}
                      variant={produto.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(produto);
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
              
              {produtosFiltrados.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {filtro ? 'Nenhum produto encontrado com o filtro aplicado' : 'Nenhum produto cadastrado'}
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

export default ProdutoModal;