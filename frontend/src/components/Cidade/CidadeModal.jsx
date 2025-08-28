import React, { useState, useEffect } from 'react';
import CidadeFormModal from './CidadeFormModal'; // Modal de cadastro de cidade
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

const CidadeModal = ({ onClose, onCidadeSelecionada }) => {
  const [cidades, setCidades] = useState([]);
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
      fetch('http://localhost:8080/cidades').then(res => res.json()),
      fetch('http://localhost:8080/estados').then(res => res.json()),
      fetch('http://localhost:8080/paises').then(res => res.json())
    ])
    .then(([cidadesData, estadosData, paisesData]) => {
      setCidades(cidadesData);
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
  const carregarCidades = () => {
    carregarDados(); // Usar a função que carrega todos os dados
  };

  const getEstadoNome = (estadoId) => {
    const estado = estados.find((e) => e.id === estadoId);
    return estado ? estado.nome : 'Não informado';
  };

  const getPaisNome = (estadoId) => {
    const estado = estados.find((e) => e.id === estadoId);
    if (!estado) return 'Não informado';
    
    const pais = paises.find((p) => p.id === parseInt(estado.paisId));
    return pais ? pais.nome : 'Não informado';
  };
  const handleOpenCadastroModal = () => {
    setIsCadastroModalOpen(true);
  };

  const handleCloseCadastroModal = () => {
    setIsCadastroModalOpen(false);
    carregarCidades(); // Atualizar lista de cidades após cadastro
  };
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCidades = [...cidades].sort((a, b) => {
      let aValue, bValue;

      if (key === 'estadoNome') {
        aValue = getEstadoNome(a.estadoId);
        bValue = getEstadoNome(b.estadoId);
      } else if (key === 'estadoPaisNome') {
        aValue = getPaisNome(a.estadoId);
        bValue = getPaisNome(b.estadoId);
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
    setCidades(sortedCidades);
  };
  const cidadesFiltradas = cidades.filter(cidade =>
    cidade.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    getEstadoNome(cidade.estadoId)?.toLowerCase().includes(filtro.toLowerCase()) ||
    getPaisNome(cidade.estadoId)?.toLowerCase().includes(filtro.toLowerCase())
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
      >        <DialogTitle sx={{ 
          bgcolor: '#ffffff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h6" fontWeight={600}>
            Selecionar Cidade
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
              placeholder="Pesquisar por cidade, estado ou país..."
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
              <Typography>Carregando cidades...</Typography>
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
                        Cidade
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'estadoNome'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('estadoNome')}
                        sx={{ fontWeight: 600 }}
                      >
                        Estado
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'estadoPaisNome'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('estadoPaisNome')}
                        sx={{ fontWeight: 600 }}
                      >
                        País
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cidadesFiltradas.map((cidade) => (
                    <TableRow 
                      key={cidade.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        cursor: 'pointer'
                      }}
                      onClick={() => onCidadeSelecionada(cidade)}
                    >                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {cidade.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getEstadoNome(cidade.estadoId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaisNome(cidade.estadoId)}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Selecionar esta cidade">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCidadeSelecionada(cidade);
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

          {cidadesFiltradas.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhuma cidade encontrada
              </Typography>
            </Box>
          )}
        </DialogContent>        <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de cadastro de cidade */}
      {isCadastroModalOpen && (
        <CidadeFormModal onClose={handleCloseCadastroModal} />
      )}
    </>
  );
};

export default CidadeModal;