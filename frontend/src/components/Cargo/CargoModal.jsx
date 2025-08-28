import React, { useState, useEffect } from 'react';
import CargoFormModal from './CargoFormModal'; // Modal de cadastro de cargo
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
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';

const CargoModal = ({ onClose, onCargoSelecionado }) => {
  const [cargos, setCargos] = useState([]);
  const [filteredCargos, setFilteredCargos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = () => {
    setLoading(true);
    // Buscar cargos da API
    fetch('http://localhost:8080/funcoes-funcionario')
      .then(response => response.json())
      .then(data => {
        // Filtrar apenas cargos ativos
        const cargosAtivos = data.filter(cargo => cargo.ativo);
        setCargos(cargosAtivos);
        setFilteredCargos(cargosAtivos);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar cargos:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Filtrar cargos baseado no termo de busca
    const filtered = cargos.filter(cargo =>
      cargo.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.id?.toString().includes(searchTerm)
    );
    setFilteredCargos(filtered);
  }, [searchTerm, cargos]);

  const handleCargoSelect = (cargo) => {
    onCargoSelecionado(cargo);
  };

  const handleOpenCadastroModal = () => {
    setIsCadastroModalOpen(true);
  };

  const handleCloseCadastroModal = () => {
    setIsCadastroModalOpen(false);
    carregarCargos(); // Atualizar lista de cargos após cadastro
  };

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
          Selecionar Cargo
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Campo de pesquisa */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          gap: 2
        }}>
          <TextField
            variant="outlined"
            placeholder="Pesquisar por código, nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {/* <Button
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
          </Button> */}
        </Box>

        {/* Tabela de cargos */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando cargos...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Carga Horária</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Requer CNH</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCargos.map((cargo) => (
                  <TableRow 
                    key={cargo.id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f8f9fa' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCargoSelect(cargo)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="primary">
                        {cargo.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {cargo.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cargo.descricao || 'Não informado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cargo.cargaHoraria ? 
                          `${parseFloat(cargo.cargaHoraria).toFixed(2).replace('.', ',')} horas` : 
                          'Não informado'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cargo.requerCnh ? 'Sim' : 'Não'}
                        size="small"
                        color={cargo.requerCnh ? 'warning' : 'default'}
                        variant={cargo.requerCnh ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Tooltip title="Selecionar este cargo">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCargoSelect(cargo);
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

        {filteredCargos.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum cargo encontrado
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
      </Dialog>

      {/* Modal de cadastro de cargo */}
      {isCadastroModalOpen && (
        <CargoFormModal onClose={handleCloseCadastroModal} />
      )}
    </>
  );
};

export default CargoModal;
