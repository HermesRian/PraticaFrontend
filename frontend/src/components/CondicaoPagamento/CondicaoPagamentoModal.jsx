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
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Alert,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const CondicaoPagamentoModal = ({ onClose, onCondicaoSelecionada }) => {
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/condicoes-pagamento')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar condições de pagamento');
        }
        return response.json();
      })
      .then((data) => {
        setCondicoesPagamento(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value.toLowerCase());
  };

  const condicoesFiltradas = condicoesPagamento.filter((condicao) => {
    if (!condicao) return false;
    
    const numParcelas = condicao.parcelasCondicao?.length || condicao.parcelas?.length || 0;
    const nome = condicao.nome || condicao.descricao || '';
    const dias = condicao.dias || '';
    
    return (
      nome.toLowerCase().includes(filtro) ||
      dias.toString().includes(filtro) ||
      numParcelas.toString().includes(filtro)
    );
  });

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: '#ffffff', borderRadius: 2 }
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
          Selecionar Condição de Pagamento
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Campo de pesquisa */}
        <Box sx={{ mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Filtrar por descrição, dias ou número de parcelas..."
            value={filtro}
            onChange={handleFiltroChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
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
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando condições de pagamento...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Dias</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Parcelas</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {condicoesFiltradas.length > 0 ? (
                  condicoesFiltradas.map((condicao) => (
                    <TableRow 
                      key={condicao.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        cursor: 'pointer'
                      }}
                      onClick={() => onCondicaoSelecionada(condicao)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {condicao.nome || condicao.descricao || 'Sem descrição'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {condicao.dias || 0}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={condicao.parcelasCondicao?.length || condicao.parcelas?.length || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={condicao.ativo ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={condicao.ativo ? 'success' : 'default'}
                          variant={condicao.ativo ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCondicaoSelecionada(condicao);
                          }}
                          sx={{ 
                            bgcolor: '#1976d2',
                            '&:hover': { bgcolor: '#1565c0' },
                            minWidth: 80
                          }}
                        >
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        Nenhuma condição de pagamento encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
  );
};

export default CondicaoPagamentoModal;
