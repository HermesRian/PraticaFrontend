import React, { useState, useEffect } from 'react';
import TransportadoraModalForm from './TransportadoraModalForm';
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
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { formatCPF, formatCNPJ, formatCEP, formatTelefone, censurarCPF, censurarCNPJ } from '../../utils/documentValidation';

const TransportadoraListMUI = () => {
  const [transportadoras, setTransportadoras] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTransportadoraId, setSelectedTransportadoraId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'razaoSocial', direction: 'asc' });
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarDocumentoCompleto, setMostrarDocumentoCompleto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [transportadorasData, cidadesData] = await Promise.all([
        fetch('http://localhost:8080/transportadoras').then(res => res.json()),
        fetch('http://localhost:8080/cidades').then(res => res.json())
      ]);
      setTransportadoras(transportadorasData);
      setCidades(cidadesData);
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

  const getCidadeNome = (cidadeId) => {
    const cidade = cidades.find((c) => c.id === cidadeId);
    return cidade ? cidade.nome : 'Não informada';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedTransportadoras = [...transportadoras].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'cidade') {
        aValue = getCidadeNome(a.cidadeId);
        bValue = getCidadeNome(b.cidadeId);
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
    setTransportadoras(sortedTransportadoras);
  };

  const handleDelete = (id) => {
    const transportadora = transportadoras.find(t => t.id === id);
    const isAtivo = transportadora?.ativo;
    const acao = isAtivo ? 'inativar' : 'ativar';
    const mensagem = isAtivo ? 
      'Tem certeza que deseja inativar esta transportadora?' : 
      'Tem certeza que deseja ativar esta transportadora?';
    
    if (window.confirm(mensagem)) {
      if (isAtivo) {
        fetch(`http://localhost:8080/transportadoras/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setTransportadoras(transportadoras.map(transportadora => 
              transportadora.id === id ? { ...transportadora, ativo: false } : transportadora
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} transportadora:`, error);
            setError(`Erro ao ${acao} transportadora`);
          });
      } else {
        fetch(`http://localhost:8080/transportadoras/${id}/ativar`, {
          method: 'PUT',
        })
          .then(() => {
            setTransportadoras(transportadoras.map(transportadora => 
              transportadora.id === id ? { ...transportadora, ativo: true } : transportadora
            ));
          })
          .catch((error) => {
            console.error(`Erro ao ${acao} transportadora:`, error);
            setError(`Erro ao ${acao} transportadora`);
          });
      }
    }
  };

  const handleView = async (transportadora) => {
    let transportadoraComDados = { ...transportadora };

    if (transportadora.cidadeId) {
      try {
        const cidadeResponse = await fetch(`http://localhost:8080/cidades/${transportadora.cidadeId}`);
        if (cidadeResponse.ok) {
          const cidadeData = await cidadeResponse.json();
          transportadoraComDados.cidadeNome = cidadeData.nome || '';
          transportadoraComDados.cidadeEstado = cidadeData.estado?.nome || '';
          transportadoraComDados.cidadeEstadoPais = cidadeData.estado?.pais?.nome || '';
        } else {
          transportadoraComDados.cidadeNome = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar cidade:', error);
        transportadoraComDados.cidadeNome = 'Erro ao carregar';
      }
    }

    if (transportadora.condicaoPagamentoId) {
      try {
        const condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${transportadora.condicaoPagamentoId}`);
        if (condicaoResponse.ok) {
          const condicaoData = await condicaoResponse.json();
          transportadoraComDados.condicaoPagamentoDescricao = condicaoData.nome || '';
        } else {
          transportadoraComDados.condicaoPagamentoDescricao = 'Erro ao carregar';
        }
      } catch (error) {
        console.error('Erro ao buscar condição de pagamento:', error);
        transportadoraComDados.condicaoPagamentoDescricao = 'Erro ao carregar';
      }
    }
    
    setTransportadoraSelecionada(transportadoraComDados);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedTransportadoraId(id);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setTransportadoraSelecionada(null);
    setIsModalOpen(false);
  };

  const transportadorasFiltradas = transportadoras.filter(transportadora => {
    const matchesText = transportadora.id?.toString().includes(filtro) ||
      transportadora.razaoSocial?.toLowerCase().includes(filtro.toLowerCase()) ||
      transportadora.nomeFantasia?.toLowerCase().includes(filtro.toLowerCase()) ||
      transportadora.cpfCnpj?.toLowerCase().includes(filtro.toLowerCase()) ||
      transportadora.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      getCidadeNome(transportadora.cidadeId)?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && transportadora.ativo) ||
      (filtroStatus === 'inativos' && !transportadora.ativo);
    
    return matchesText && matchesStatus;
  });

  const getTipoLabel = (tipo) => {
    return tipo === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Carregando transportadoras...</Typography>
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
        {/* Cabeçalho  */}        
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
              placeholder="Pesquisar por código, razão social, CPF/CNPJ, email..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', md: 300 },
                flexGrow: { xs: 1, md: 0 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativos">Ativos</MenuItem>
                <MenuItem value="inativos">Inativos</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={mostrarDocumentoCompleto}
                  onChange={(e) => setMostrarDocumentoCompleto(e.target.checked)}
                  size="small"
                />
              }
              label="Mostrar CPF/CNPJ completo"
              sx={{ ml: 2, whiteSpace: 'nowrap' }}
            />
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

        {/* tabela */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Exibindo {transportadorasFiltradas.length} de {transportadoras.length} transportadoras
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
                    active={sortConfig.key === 'razaoSocial'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('razaoSocial')}
                    sx={{ fontWeight: 600 }}
                  >
                    Transportadora
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'tipo'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('tipo')}
                    sx={{ fontWeight: 600 }}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cpfCnpj'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cpfCnpj')}
                    sx={{ fontWeight: 600 }}
                  >
                    CPF/CNPJ
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'email'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('email')}
                    sx={{ fontWeight: 600 }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'cidade'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('cidade')}
                    sx={{ fontWeight: 600 }}
                  >
                    Cidade
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
              {transportadorasFiltradas.map((transportadora) => (                
                <TableRow 
                  key={transportadora.id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary">
                      {transportadora.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                        {getTipoLabel(transportadora.tipo) === 'Pessoa Física' ? 
                          <PersonIcon fontSize="small" /> : 
                          <BusinessIcon fontSize="small" />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {transportadora.razaoSocial}
                        </Typography>
                        {transportadora.nomeFantasia && (
                          <Typography variant="caption" color="text.secondary">
                            {transportadora.nomeFantasia}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoLabel(transportadora.tipo)}
                      size="small"
                      color={getTipoLabel(transportadora.tipo) === 'Pessoa Física' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>                  
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {transportadora.cpfCnpj ? (
                        getTipoLabel(transportadora.tipo) === 'Pessoa Física' ? 
                        (mostrarDocumentoCompleto ? formatCPF(transportadora.cpfCnpj) : censurarCPF(transportadora.cpfCnpj)) : 
                        (mostrarDocumentoCompleto ? formatCNPJ(transportadora.cpfCnpj) : censurarCNPJ(transportadora.cpfCnpj))
                      ) : 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transportadora.email || 'Não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getCidadeNome(transportadora.cidadeId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transportadora.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={transportadora.ativo ? 'success' : 'default'}
                      variant={transportadora.ativo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => handleView(transportadora)}
                          sx={{ color: '#17a2b8' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transportadora.id)}
                          sx={{ color: '#28a745' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={transportadora.ativo ? "Inativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(transportadora.id)}
                          sx={{ color: transportadora.ativo ? '#dc3545' : '#28a745' }}
                        >
                          {transportadora.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {transportadorasFiltradas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {transportadoras.length === 0 
                ? 'Nenhuma transportadora cadastrada' 
                : `Nenhuma transportadora ${filtroStatus === 'todos' ? '' : filtroStatus === 'ativos' ? 'ativa' : 'inativa'} encontrada`
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

      {/* modal form */}
      <TransportadoraModalForm
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedTransportadoraId(null);
          loadData();
        }}
        transportadoraId={selectedTransportadoraId}
        onSave={loadData}
      />

      {/* modal detalhes */}
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
            Visualizar Transportadora
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {transportadoraSelecionada && (
          <DialogContent sx={{ p: 4 }}>

            {/* titulo e switch */}
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
                Dados da Transportadora
              </Typography>              
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={transportadoraSelecionada.ativo}
                      disabled
                      color="primary"
                    />
                  }
                  label="Ativo"
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            {/* linha 1*/}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '6%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={transportadoraSelecionada.id || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '16%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Pessoa"
                  value={getTipoLabel(transportadoraSelecionada.tipo)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Razão Social"
                  value={transportadoraSelecionada.razaoSocial || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>              

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome Fantasia"
                  value={transportadoraSelecionada.nomeFantasia || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '18%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CPF/CNPJ"
                  value={transportadoraSelecionada.cpfCnpj ? (
                    getTipoLabel(transportadoraSelecionada.tipo) === 'Pessoa Física' ? 
                    formatCPF(transportadoraSelecionada.cpfCnpj) : 
                    formatCNPJ(transportadoraSelecionada.cpfCnpj)
                  ) : ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* linha 2 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Endereço"
                  value={transportadoraSelecionada.endereco || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '5%', minWidth: 80 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={transportadoraSelecionada.numero || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
                
              <Grid item sx={{ width: '13%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Complemento"
                  value={transportadoraSelecionada.complemento || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '13%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bairro"
                  value={transportadoraSelecionada.bairro || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '10%', minWidth: 100 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CEP"
                  value={formatCEP(transportadoraSelecionada.cep) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 150 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade"
                  value={transportadoraSelecionada.cidadeNome ? `${transportadoraSelecionada.cidadeNome} - ${transportadoraSelecionada.cidadeEstado}` : ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '14%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefone"
                  value={formatTelefone(transportadoraSelecionada.telefone) || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* linha 3 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item sx={{ width: '20%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={transportadoraSelecionada.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Website"
                  value={transportadoraSelecionada.website || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '15%', minWidth: 120 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={transportadoraSelecionada.tipo === 'F' ? 'RG' : 'Inscrição Estadual'}
                  value={transportadoraSelecionada.rgInscricaoEstadual || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '20%', minWidth: 140 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Condição de Pagamento"
                  value={transportadoraSelecionada.condicaoPagamentoDescricao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item sx={{ width: '25%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observação"
                  value={transportadoraSelecionada.observacao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  multiline
                  minRows={1}
                />
              </Grid>
            </Grid>
          </DialogContent>
        )}
        
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', gap: 1 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Fechar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleCloseModal();
              handleEdit(transportadoraSelecionada?.id);
            }}
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransportadoraListMUI;