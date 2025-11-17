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
  InputAdornment,
  Chip,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const CategoriaModal = ({ open, onClose, onSelect, onAddNew, refreshTrigger }) => {
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategorias();
    }
  }, [open, refreshTrigger]);

  const loadCategorias = () => {
    setLoading(true);
    fetch('http://localhost:8080/categorias')
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar categorias:', error);
        setLoading(false);
      });
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    const searchTerm = filtro.toLowerCase();
    return (
      categoria.nome?.toLowerCase().includes(searchTerm) ||
      categoria.id?.toString().includes(searchTerm)
    );
  });

  const handleSelect = (categoria) => {
    onSelect(categoria);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6">Selecionar Categoria</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar por nome ou código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Contador de resultados e botão adicionar */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Carregando...' : `${categoriasFiltradas.length} categoria(s) encontrada(s)`}
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

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '45%' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }} align="center">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : categoriasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {filtro ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                categoriasFiltradas.map((categoria) => (
                  <TableRow 
                    key={categoria.id}
                    hover
                    onClick={() => handleSelect(categoria)}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell>{categoria.id}</TableCell>
                    <TableCell>{categoria.nome}</TableCell>
                    <TableCell>
                      <Chip
                        label={categoria.ativo ? 'Ativo' : 'Inativo'}
                        color={categoria.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(categoria);
                        }}
                        sx={{
                          backgroundColor: '#28a745',
                          '&:hover': {
                            backgroundColor: '#218838',
                          },
                        }}
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoriaModal;
