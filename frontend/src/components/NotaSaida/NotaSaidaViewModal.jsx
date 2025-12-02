import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const NotaSaidaViewModal = ({ open, onClose, notaId }) => {
  const [nota, setNota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [parcelasCondicao, setParcelasCondicao] = useState([]);

  // Carregar unidades de medida e produtos
  useEffect(() => {
    if (open) {
      // Carregar unidades de medida
      fetch('http://localhost:8080/unidades-medida')
        .then(res => res.json())
        .then(data => {
          console.log('Unidades de medida carregadas no modal:', data);
          setUnidadesMedida(data);
        })
        .catch(error => console.error('Erro ao carregar unidades de medida:', error));

      // Carregar produtos
      fetch('http://localhost:8080/produtos')
        .then(res => res.json())
        .then(data => {
          console.log('Produtos carregados no modal:', data);
          setProdutos(data);
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
    }
  }, [open]);

  const loadNota = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/notas-saida/${notaId}`);
      const data = await response.json();
      console.log('Nota carregada para visualização:', data);
      console.log('Itens da nota:', data.itens);
      setNota(data);

      // Carregar parcelas da condição de pagamento
      if (data.condicaoPagamentoId) {
        try {
          const condicaoResponse = await fetch(`http://localhost:8080/condicoes-pagamento/${data.condicaoPagamentoId}`);
          if (condicaoResponse.ok) {
            const condicaoData = await condicaoResponse.json();
            if (condicaoData.parcelasCondicao && condicaoData.parcelasCondicao.length > 0) {
              setParcelasCondicao(condicaoData.parcelasCondicao);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar parcelas da condição:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
    } finally {
      setLoading(false);
    }
  }, [notaId]);

  useEffect(() => {
    if (open && notaId) {
      loadNota();
    }
  }, [open, notaId, loadNota]);

  // Função para buscar nome da unidade de medida pelo ID
  const getUnidadeMedidaNome = (unidadeMedidaId) => {
    if (!unidadeMedidaId || !unidadesMedida.length) return 'UN';
    const unidade = unidadesMedida.find(u => u.id === unidadeMedidaId);
    return unidade ? unidade.nome : 'UN';
  };

  // Função para buscar nome do produto pelo ID
  const getProdutoNome = (produtoId) => {
    if (!produtoId || !produtos.length) return '-';
    const produto = produtos.find(p => p.id === parseInt(produtoId));
    return produto ? produto.nome : '-';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  // Função para calcular o total da nota
  const calcularTotalNota = () => {
    if (!nota) return 0;
    const totalProdutos = nota.itens?.reduce((sum, item) => sum + (item.valorTotal || 0), 0) || 0;
    const totalNota = totalProdutos +
      parseFloat(nota.valorFrete || 0) +
      parseFloat(nota.valorSeguro || 0) +
      parseFloat(nota.outrasDespesas || 0);
    return totalNota;
  };

  // Função para calcular o valor de cada parcela com base no percentual
  const calcularValorParcela = (parcela) => {
    const totalNota = calcularTotalNota();
    const percentual = parseFloat(parcela.percentual || 0);
    return (totalNota * percentual) / 100;
  };

  // Função para calcular a data de vencimento da parcela baseada na data de emissão
  const calcularDataVencimento = (parcela) => {
    if (!nota?.dataEmissao || !parcela.dias) {
      return 'A definir';
    }
    
    // Cria uma data a partir da data de emissão
    const dataEmissao = new Date(nota.dataEmissao + 'T00:00:00');
    
    // Adiciona os dias da parcela
    const dataVencimento = new Date(dataEmissao);
    dataVencimento.setDate(dataVencimento.getDate() + parseInt(parcela.dias));
    
    // Formata a data
    return dataVencimento.toLocaleDateString('pt-BR');
  };

  if (!nota && !loading) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
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
          Visualizar Nota de Saída
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Carregando nota...</Typography>
          </Box>
        ) : nota ? (
            <>
              {/* Título */}
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
                  Dados da Nota de Saída
                </Typography>
                <Box sx={{ width: 120 }}></Box>
              </Box>

            {/* Linha 1: Número, Modelo, Série, Cliente, Data Emissão, Data Chegada */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '10%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número"
                  value={nota.numero || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '10%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Modelo"
                  value={nota.modelo || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '10%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Série"
                  value={nota.serie || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cliente"
                  value={nota.cliente ? 
                    (nota.cliente.razaoSocial || nota.cliente.nome || nota.cliente.nomeFantasia || 'Não informado') : 
                    'Não informado'
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data Emissão"
                  type="date"
                  value={formatDate(nota.dataEmissao)}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '15%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data Chegada"
                  type="date"
                  value={formatDate(nota.dataChegada)}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>
            </Grid>

            {/* Tabela de Itens */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Produto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Unid</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Qtd</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Valor Un.</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Desconto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nota.itens && nota.itens.length > 0 ? (
                    nota.itens.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.produtoCodigo || item.produtoId || '-'}</TableCell>
                        <TableCell>{item.produtoNome || getProdutoNome(item.produtoId) || '-'}</TableCell>
                        <TableCell>{item.unidade || getUnidadeMedidaNome(item.produto?.unidadeMedidaId) || '-'}</TableCell>
                        <TableCell>{item.quantidade || 0}</TableCell>
                        <TableCell>R$ {(item.valorUnitario || 0).toFixed(2)}</TableCell>
                        <TableCell>R$ {(item.valorDesconto || 0).toFixed(2)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>R$ {(item.valorTotal || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Nenhum item adicionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Total dos Produtos */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
                Total Produtos: 
                <Typography component="span" variant="subtitle1" fontWeight={600} color="text.primary" sx={{ ml: 1 }}>
                  R$ {nota.itens ? nota.itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0).toFixed(2) : '0.00'}
                </Typography>
              </Typography>
            </Box>

            {/* Frete e Outras Despesas */}
            
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '30%' }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
                    Tipo Frete
                  </FormLabel>
                  <RadioGroup
                    row
                    value={nota.tipoFrete || 'Nenhum'}
                    sx={{ gap: 1 }}
                  >
                    <FormControlLabel 
                      value="CIF" 
                      control={<Radio size="small" disabled />} 
                      label="CIF"
                      sx={{ 
                        '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                        mr: 1
                      }}
                    />
                    <FormControlLabel 
                      value="FOB" 
                      control={<Radio size="small" disabled />} 
                      label="FOB"
                      sx={{ 
                        '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                        mr: 1
                      }}
                    />
                    <FormControlLabel 
                      value="Nenhum" 
                      control={<Radio size="small" disabled />} 
                      label="Nenhum"
                      sx={{ 
                        '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                        mr: 0
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Campos numéricos sempre visíveis no modo visualização */}
              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Frete"
                  type="text"
                  value={`R$ ${(nota.valorFrete || 0).toFixed(2)}`}
                  InputProps={{ 
                    readOnly: true,
                    style: { textAlign: 'right' }
                  }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Seguro"
                  type="text"
                  value={`R$ ${(nota.valorSeguro || 0).toFixed(2)}`}
                  InputProps={{ 
                    readOnly: true,
                    style: { textAlign: 'right' }
                  }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '20%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Outras Despesas"
                  type="text"
                  value={`R$ ${(nota.outrasDespesas || 0).toFixed(2)}`}
                  InputProps={{ 
                    readOnly: true,
                    style: { textAlign: 'right' }
                  }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>
            </Grid>

            {/* Total da Nota */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mr: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
                Total da Nota: 
                <Typography component="span" variant="h6" fontWeight={700} color="text.primary" sx={{ ml: 1 }}>
                  R$ {(
                    (nota.itens ? nota.itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0) : 0) +
                    parseFloat(nota.valorFrete || 0) +
                    parseFloat(nota.valorSeguro || 0) +
                    parseFloat(nota.outrasDespesas || 0)
                  ).toFixed(2)}
                </Typography>
              </Typography>
            </Box>

            {/* Condição de Pagamento */}
            
            <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Grid item sx={{ width: '12%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cód Cond. Pgto"
                  value={nota.condicaoPagamentoId || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>

              <Grid item sx={{ width: '30%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Condição de Pagamento"
                  value={nota.condicaoPagamento?.nome}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>
            </Grid>

            {/* Grid de Parcelas da Condição de Pagamento */}
            {parcelasCondicao.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Parcela</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cód. Forma Pgto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Forma de Pgto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Data Vencimento</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Valor Parcela</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcelasCondicao.map((parcela, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{parcela.numeroParcela}</TableCell>
                        <TableCell>{parcela.formaPagamento?.id || '-'}</TableCell>
                        <TableCell>{parcela.formaPagamento?.nome || 'Não informada'}</TableCell>
                        <TableCell>{calcularDataVencimento(parcela)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          R$ {calcularValorParcela(parcela).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Observações */}
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  label="Observações"
                  value={nota.observacoes || nota.observacao || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Grid>
            </Grid>

            {/* Informações de Registro */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: '1px solid #eee',
            }}>
              <Box sx={{ flex: 1 }}>
                {nota.dataCriacao && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Data de cadastro: {new Date(nota.dataCriacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
                {nota.ultimaModificacao && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Última modificação: {new Date(nota.ultimaModificacao).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">
              Erro ao carregar os dados da nota
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
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

export default NotaSaidaViewModal;
