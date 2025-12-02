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

const MarcaModal = ({ open, onClose, onSelect, onAddNew, refreshTrigger }) => {
  const [marcas, setMarcas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega dados quando o modal abre
  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  // Recarrega marcas quando refreshTrigger muda (nova marca cadastrada)
  useEffect(() => {
    if (refreshTrigger > 0) {
      carregarDados();
    }
  }, [refreshTrigger]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/marcas');
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (marca) => {
    onSelect(marca);
    onClose();
    setFiltro('');
  };

  const marcasFiltradas = marcas.filter(marca =>
    marca.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    marca.id?.toString().includes(filtro)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          Selecionar Marca
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
            placeholder="Pesquisar por nome ou ID da marca..."
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
            {loading ? 'Carregando...' : `${marcasFiltradas.length} marca(s) encontrada(s)`}
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

        {/* Tabela de marcas */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa', width: 150 }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marcasFiltradas.map((marca) => (
                <TableRow 
                  key={marca.id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                  onClick={() => handleSelect(marca)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {marca.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {marca.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={marca.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={marca.ativo ? 'success' : 'default'}
                      variant={marca.ativo ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(marca);
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
              {marcasFiltradas.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {filtro ? 'Nenhuma marca encontrada com o filtro aplicado' : 'Nenhuma marca cadastrada'}
                    </Typography>
                  </TableCell>
                </TableRow>
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

export default MarcaModal;
