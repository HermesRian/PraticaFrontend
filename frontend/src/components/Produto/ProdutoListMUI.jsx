import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProdutoModalForm from './ProdutoModalForm';
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
  Inventory as InventoryIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const ProdutoListMUI = () => {
  const [produtos, setProdutos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [produtosData, marcasData, unidadesMedidaData] = await Promise.all([
        fetch('http://localhost:8080/produtos').then(res => res.json()),
        fetch('http://localhost:8080/marcas').then(res => res.json()).catch(() => []),
        fetch('http://localhost:8080/unidades-medida').then(res => res.json()).catch(() => [])
      ]);
      setProdutos(produtosData);
      setMarcas(marcasData);
      setUnidadesMedida(unidadesMedidaData);
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

  const getMarcaNome = (marcaId) => {
    const marca = marcas.find((m) => m.id === marcaId);
    return marca ? marca.nome : 'Não informada';
  };

  const getUnidadeMedidaNome = (unidadeMedidaId) => {
    const unidade = unidadesMedida.find((u) => u.id === unidadeMedidaId);
    return unidade ? unidade.nome : 'Não informada';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProdutos = [...produtos].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'marca') {
        aValue = getMarcaNome(a.marcaId);
        bValue = getMarcaNome(b.marcaId);
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
    setProdutos(sortedProdutos);
  };

  const handleDelete = (id) => {
    const produto = produtos.find(p => p.id === id);
    const isAtivo = produto?.ativo;
    const acao = isAtivo ? 'inativar' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja inativar este produto?' : 
      'Tem certeza que deseja ativar este produto?';
    
    if (window.confirm(mensagem)) {
      if (isAtivo) {
        fetch(`http://localhost:8080/produtos/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setProdutos(produtos.map(produto => 
              produto.id === id ? { ...produto, ativo: false } : produto
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} produto:`, error);
            setError(`Erro ao ${acao} produto`);
          });
      } else {
        const produtoAtualizado = {
          ...produto,
          ativo: true,
          valorVenda: produto.valorVenda ? parseFloat(produto.valorVenda) : null,
          valorCompra: produto.valorCompra ? parseFloat(produto.valorCompra) : null,
          percentualLucro: produto.percentualLucro ? parseFloat(produto.percentualLucro) : null,
        };

        fetch(`http://localhost:8080/produtos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produtoAtualizado),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao ativar produto');
            }
            return response.json();
          })
          .then(() => {
            setProdutos(produtos.map(produto => 
              produto.id === id ? { ...produto, ativo: true } : produto
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} produto:`, error);
            setError(`Erro ao ${acao} produto`);
          });
      }
    }
  };

  const handleView = async (produto) => {
    let produtoComDetalhes = { ...produto };
    
    if (produto.marcaId) {
      try {
        const marcaResponse = await fetch(`http://localhost:8080/marcas/${produto.marcaId}`);
        if (marcaResponse.ok) {
          const marcaData = await marcaResponse.json();
          produtoComDetalhes.marcaDescricao = marcaData.nome || '';
        } else {
          produtoComDetalhes.marcaDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar marca:', error);
        produtoComDetalhes.marcaDescricao = 'Erro ao carregar';
      }
    }

    if (produto.unidadeMedidaId) {
      try {
        const unidadeResponse = await fetch(`http://localhost:8080/unidades-medida/${produto.unidadeMedidaId}`);
        if (unidadeResponse.ok) {
          const unidadeData = await unidadeResponse.json();
          produtoComDetalhes.unidadeMedidaDescricao = unidadeData.nome || '';
        } else {
          produtoComDetalhes.unidadeMedidaDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar unidade de medida:', error);
        produtoComDetalhes.unidadeMedidaDescricao = 'Erro ao carregar';
      }
    }
    
    setProdutoSelecionado(produtoComDetalhes);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setProdutoSelecionado(null);
    setIsModalOpen(false);
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchesText = produto.id?.toString().includes(filtro) ||
      produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      getMarcaNome(produto.marcaId)?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && produto.ativo) ||
      (filtroStatus === 'inativos' && !produto.ativo);
    
    return matchesText && matchesStatus;
  });

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando produtos...</Typography>
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
              placeholder="Pesquisar por código, nome, descrição, marca..."
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
            Exibindo {produtosFiltrados.length} de {produtos.length} produtos
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
                    Produto
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'codigo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('codigo')}
                    sx={{ fontWeight: 600 }}
                  >
                    Código Produto
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'valorVenda'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('valorVenda')}
                    sx={{ fontWeight: 600 }}
                  >
                    Preço
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'quantidadeEstoque'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('quantidadeEstoque')}
                    sx={{ fontWeight: 600 }}
                  >
                    Estoque
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'marca'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('marca')}
                    sx={{ fontWeight: 600 }}
                  >
                    Marca
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
              {produtosFiltrados.map((produto) => (
                <TableRow 
                  key={produto.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {produto.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        <InventoryIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {produto.nome}
                        </Typography>
                        {produto.descricao && (
                          <Typography variant="caption" color="text.secondary">
                            {produto.descricao.length > 30 
                              ? produto.descricao.substring(0, 30) + '...' 
                              : produto.descricao}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {produto.codigo || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="success.main">
                      {formatCurrency(produto.valorVenda)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={produto.quantidadeEstoque}
                      size="small"
                      color={produto.quantidadeEstoque <= (produto.quantidadeMinima || 1) ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getMarcaNome(produto.marcaId)}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(produto)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/produtos/editar/${produto.id}`}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={produto.ativo ? "Inativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(produto.id)}
                          sx={{ color: produto.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {produto.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {produtosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {produtos.length === 0 
                ? 'Nenhum produto cadastrado' 
                : `Nenhum produto ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativo' : 'inativo'} encontrado`
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
            Visualizar Produto
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {produtoSelecionado && (
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
                Dados do Produto
              </Typography>
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={produtoSelecionado.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* Linha 1: Código, Nome, Código Produto */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '6%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={produtoSelecionado.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do Produto"
                  value={produtoSelecionado.nome || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '47%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código do Produto"
                  value={produtoSelecionado.codigo || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 2: Preços e Estoque */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Preço"
                  value={formatCurrency(produtoSelecionado.valorVenda)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Compra"
                  value={formatCurrency(produtoSelecionado.valorCompra)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Custo do Produto"
                  value={formatCurrency(produtoSelecionado.custoProduto)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Venda"
                  value={formatCurrency(produtoSelecionado.valorVenda)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estoque Atual"
                  value={produtoSelecionado.quantidadeEstoque || '0'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estoque Mínimo"
                  value={produtoSelecionado.quantidadeMinima || '1'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="% Lucro"
                  value={produtoSelecionado.percentualLucro ? 
                    `${parseFloat(produtoSelecionado.percentualLucro).toFixed(2)}%` : 
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 3: Marca e Unidade */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '50%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Marca"
                  value={produtoSelecionado.marcaDescricao || getMarcaNome(produtoSelecionado.marcaId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item sx={{ width: '50%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Unidade de Medida"
                  value={produtoSelecionado.unidadeMedidaDescricao || getUnidadeMedidaNome(produtoSelecionado.unidadeMedidaId)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 4: Descrição */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Descrição"
                  value={produtoSelecionado.descricao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Linha 5: Observações */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Observações"
                  value={produtoSelecionado.observacoes || ''}
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
                {produtoSelecionado.dataCriacao && (
                  <Typography variant="caption" color="text.secondary">
                    Data de cadastro: {new Date(produtoSelecionado.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {produtoSelecionado.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary">
                    Última modificação: {new Date(produtoSelecionado.ultimaModificacao).toLocaleString('pt-BR')}
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
          {produtoSelecionado && (
            <Button
              component={Link}
              to={`/produtos/editar/${produtoSelecionado.id}`}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleCloseModal}
            >
              Editar
            </Button>
          )}
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

export default ProdutoListMUI;