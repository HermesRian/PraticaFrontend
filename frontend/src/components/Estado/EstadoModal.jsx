import React, { useState, useEffect } from 'react';
import EstadoFormModal from '../Estado/EstadoFormModal'; // Modal de cadastro de estado
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

const EstadoModal = ({ onClose, onEstadoSelecionado }) => {
  const [estados, setEstados] = useState([]);
  const [paises, setPaises] = useState([]);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8080/estados').then(res => res.json()),
      fetch('http://localhost:8080/paises').then(res => res.json())
    ])
    .then(([estadosData, paisesData]) => {
      setEstados(estadosData);
      setPaises(paisesData);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
      setLoading(false);
    });
  };

  const getPaisNome = (paisId) => {
    const pais = paises.find((p) => p.id === parseInt(paisId));
    return pais ? pais.nome : 'Não informado';
  };
  const handleOpenCadastroModal = () => {
    setIsCadastroModalOpen(true);
  };

  const handleCloseCadastroModal = () => {
    setIsCadastroModalOpen(false);
    carregarDados(); // Atualizar lista de estados após cadastro
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedEstados = [...estados].sort((a, b) => {
      let aValue, bValue;

      if (key === 'paisNome') {
        aValue = getPaisNome(a.paisId);
        bValue = getPaisNome(b.paisId);
      } else {
        aValue = a[key];
        bValue = b[key];
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
    setEstados(sortedEstados);
  };

  const estadosFiltrados = estados.filter(estado =>
    estado.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    estado.uf?.toLowerCase().includes(filtro.toLowerCase()) ||
    getPaisNome(estado.paisId)?.toLowerCase().includes(filtro.toLowerCase())
  );
  return (
    <>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, minHeight: '70vh' }
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
            Selecionar Estado
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
              placeholder="Pesquisar por estado, UF ou país..."
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
              <Typography>Carregando estados...</Typography>
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
                        Estado
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'uf'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('uf')}
                        sx={{ fontWeight: 600 }}
                      >
                        UF
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'paisNome'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('paisNome')}
                        sx={{ fontWeight: 600 }}
                      >
                        País
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estadosFiltrados.map((estado) => (
                    <TableRow 
                      key={estado.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        cursor: 'pointer'
                      }}
                      onClick={() => onEstadoSelecionado(estado)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {estado.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={estado.uf}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getPaisNome(estado.paisId)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Selecionar este estado">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEstadoSelecionado(estado);
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

          {estadosFiltrados.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum estado encontrado
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
      </Dialog>      {/* Modal de cadastro de estado */}
      <EstadoFormModal 
        open={isCadastroModalOpen}
        onClose={handleCloseCadastroModal}
        onSuccess={carregarDados}
      />
    </>
  );
};

export default EstadoModal;