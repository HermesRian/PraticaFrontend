import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon,
  Map as MapIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    // Pessoas
    {
      title: 'Clientes',
      description: 'Cadastro e gestão de clientes',
      icon: <PeopleIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/clientes',
      color: '#e3f2fd'
    },
    {
      title: 'Fornecedores',
      description: 'Cadastro e gestão de fornecedores',
      icon: <BusinessIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/fornecedores',
      color: '#e3f2fd'
    },
    {
      title: 'Funcionários',
      description: 'Cadastro e gestão de funcionários',
      icon: <WorkIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/funcionarios',
      color: '#e3f2fd'
    },
    {
      title: 'Cargos',
      description: 'Funções dos funcionários',
      icon: <BadgeIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/funcoes-funcionario',
      color: '#e3f2fd'
    },
    
    //Financeiro
    {
      title: 'Formas de Pagamento',
      description: 'Métodos de pagamento disponíveis',
      icon: <PaymentIcon sx={{ fontSize: 48, color: '#388e3c' }} />,
      path: '/formas-pagamento',
      color: '#e8f5e8'
    },
    {
      title: 'Condições de Pagamento',
      description: 'Termos e condições de pagamento',
      icon: <AccountBalanceIcon sx={{ fontSize: 48, color: '#388e3c' }} />,
      path: '/condicoes-pagamento',
      color: '#e8f5e8'
    },
    
    //Localização
    {
      title: 'Países',
      description: 'Cadastro de países',
      icon: <PublicIcon sx={{ fontSize: 48, color: '#f57c00' }} />,
      path: '/paises',
      color: '#fff3e0'
    },
    {
      title: 'Estados',
      description: 'Cadastro de estados',
      icon: <MapIcon sx={{ fontSize: 48, color: '#f57c00' }} />,
      path: '/estados',
      color: '#fff3e0'
    },
    {
      title: 'Cidades',
      description: 'Cadastro de cidades',
      icon: <LocationCityIcon sx={{ fontSize: 48, color: '#f57c00' }} />,
      path: '/cidades',
      color: '#fff3e0'
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: '#ffffff', 
      minHeight: '100vh' 
    }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            opacity: 0.9,
            fontWeight: 400,
            fontSize: '1.1rem'
          }}
        >
        </Typography>

      {/* Seção Pessoas */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            color: '#2c3e50', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            letterSpacing: '-0.25px'
          }}
        >
          <PeopleIcon sx={{ mr: 1.5, color: '#1976d2', fontSize: 28 }} />
          Gestão de Pessoas
        </Typography>
        
        <Grid container spacing={3}>
          {dashboardCards.slice(0, 4).map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: 200,
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => handleCardClick(card.path)}
              >
                <CardContent sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: card.color
                }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500, 
                      color: '#2c3e50',
                      fontSize: '1.1rem',
                      letterSpacing: '-0.25px'
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 400
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Seção Financeiro */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            color: '#2c3e50', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            letterSpacing: '-0.25px'
          }}
        >
          <PaymentIcon sx={{ mr: 1.5, color: '#388e3c', fontSize: 28 }} />
          Configurações Financeiras
        </Typography>
        
        <Grid container spacing={3}>
          {dashboardCards.slice(4, 6).map((card, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: 200,
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => handleCardClick(card.path)}
              >
                <CardContent sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: card.color
                }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500, 
                      color: '#2c3e50',
                      fontSize: '1.1rem',
                      letterSpacing: '-0.25px'
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 400
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Seção Localização */}
      <Box>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            color: '#2c3e50', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            letterSpacing: '-0.25px'
          }}
        >
          <LocationCityIcon sx={{ mr: 1.5, color: '#f57c00', fontSize: 28 }} />
          Localização
        </Typography>
        
        <Grid container spacing={3}>
          {dashboardCards.slice(6, 9).map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: 200,
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => handleCardClick(card.path)}
              >
                <CardContent sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: card.color
                }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500, 
                      color: '#2c3e50',
                      fontSize: '1.1rem',
                      letterSpacing: '-0.25px'
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 400
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
