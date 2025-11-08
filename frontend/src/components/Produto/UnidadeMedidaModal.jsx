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
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const UnidadeMedidaModal = ({ open, onClose, onSelect }) => {
  const [unidades, setUnidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega dados quando o modal abre
  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/unidades-medida');
      if (response.ok) {
        const data = await response.json();
        setUnidades(data);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (unidade) => {
    onSelect(unidade);
    onClose();
    setFiltro('');
  };

  const unidadesFiltradas = unidades.filter(unidade =>
    unidade.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    unidade.sigla?.toLowerCase().includes(filtro.toLowerCase()) ||
    unidade.id?.toString().includes(filtro)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          Selecionar Unidade de Medida
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
            placeholder="Pesquisar por código, nome ou sigla..."
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

        {/* Contador de resultados */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Carregando...' : `${unidadesFiltradas.length} unidade(s) encontrada(s)`}
          </Typography>
        </Box>

        {/* Tabela de unidades */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Sigla</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa', width: 100 }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unidadesFiltradas.map((unidade) => (
                <TableRow 
                  key={unidade.id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                  onClick={() => handleSelect(unidade)}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                      {unidade.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {unidade.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {unidade.sigla}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(unidade);
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
              
              {unidadesFiltradas.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {filtro ? 'Nenhuma unidade encontrada com o filtro aplicado' : 'Nenhuma unidade cadastrada'}
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

export default UnidadeMedidaModal;
