import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PaisFormModal from './PaisFormModal';

const PaisModal = ({ onClose, onPaisSelecionado }) => {  const [paises, setPaises] = useState([]);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });

  useEffect(() => {
    carregarPaises();
  }, []);

  const carregarPaises = () => {
    setLoading(true);
    fetch('http://localhost:8080/paises')
      .then((response) => response.json())
      .then((data) => {
        setPaises(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar países:', error);
        setError('Erro ao carregar países');
        setLoading(false);
      });
  };

  const handleOpenCadastroModal = () => {
    setIsCadastroModalOpen(true);
  };
  const handleCloseCadastroModal = () => {
    setIsCadastroModalOpen(false);
    carregarPaises();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedPaises = [...paises].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

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
    setPaises(sortedPaises);
  };

  const paisesFiltrados = paises.filter(pais =>
    pais.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    pais.sigla?.toLowerCase().includes(filtro.toLowerCase()) ||
    pais.codigo?.toString().includes(filtro)
  );

  return (    <>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#ffffff', borderRadius: 2, minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#ffffff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h6" fontWeight={600}>
            Selecionar País
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Cabeçalho com pesquisa e botão */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            gap: 2
          }}>
            <TextField
              variant="outlined"
              placeholder="Pesquisar por país, sigla ou código..."
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
                width: 350,
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
            <Button
              onClick={handleOpenCadastroModal}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ 
                bgcolor: '#28a745',
                '&:hover': { bgcolor: '#218838' },
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

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Carregando países...</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'nome'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('nome')}
                        sx={{ fontWeight: 600 }}
                      >
                        País
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'sigla'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('sigla')}
                        sx={{ fontWeight: 600 }}
                      >
                        Sigla
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'codigo'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('codigo')}
                        sx={{ fontWeight: 600 }}
                      >
                        Código
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paisesFiltrados.map((pais) => (
                    <TableRow 
                      key={pais.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        cursor: 'pointer'
                      }}
                      onClick={() => onPaisSelecionado(pais)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {pais.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pais.sigla}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {pais.codigo}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Selecionar este país">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPaisSelecionado(pais);
                            }}
                            sx={{ 
                              bgcolor: '#1976d2',
                              '&:hover': { bgcolor: '#1565c0' },
                              minWidth: 80
                            }}
                          >
                            Selecionar
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {paisesFiltrados.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum país encontrado
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>{/* Modal de cadastro de país */}
      <PaisFormModal 
        open={isCadastroModalOpen}
        onClose={handleCloseCadastroModal}
        onSuccess={carregarPaises}
      />
    </>
  );
};

export default PaisModal;