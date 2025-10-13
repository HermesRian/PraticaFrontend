

  import React from 'react';
  import { AppProvider } from '@toolpad/core/AppProvider';
  import { DashboardLayout } from '@toolpad/core/DashboardLayout';
  import { useNavigate, useLocation } from 'react-router-dom';

  import {
    People as PeopleIcon,
    Business as BusinessIcon,
    LocalShipping as LocalShippingIcon,
    Work as WorkIcon,
    Payment as PaymentIcon,
    AccountBalance as AccountBalanceIcon,
    Public as PublicIcon,
    LocationOn as LocationOnIcon,
    LocationCity as LocationCityIcon,
    Inventory as InventoryIcon,
    Dashboard as DashboardIcon,
    Folder as FolderIcon,
    AccountBox as AccountBoxIcon,
    AttachMoney as AttachMoneyIcon,
    Map as MapIcon,
    Badge as BadgeIcon,
    LocalMall as LocalMallIcon,
    Category as CategoryIcon,
    Sell as SellIcon,
  } from '@mui/icons-material';

  const NAVIGATION = [
    {
      segment: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      kind: 'divider',
    },
    {
      kind: 'header',
      title: 'Cadastros',
    },
    {
      segment: 'clientes',
      title: 'Clientes',
      icon: <PeopleIcon />,
    },
    {
      segment: 'fornecedores',
      title: 'Fornecedores',
      icon: <BusinessIcon />,
    },
    {
      segment: 'transportadoras',
      title: 'Transportadoras',
      icon: <LocalShippingIcon />,
    },
    {
      segment: 'funcionarios',
      title: 'Funcionários',
      icon: <WorkIcon />,
    },
    {
      segment: 'funcoes-funcionario',
      title: 'Cargos',
      icon: <BadgeIcon />,
    },

    {
      segment: 'produtos',
      title: 'Produtos',
      icon: <LocalMallIcon />,
    },
    {
      segment: 'categorias',
      title: 'Categorias',
      icon: <SellIcon />,
    },

    {
      kind: 'divider',
    },
    {
      kind: 'header',
      title: 'Financeiro',
    },
    {
      segment: 'formas-pagamento',
      title: 'Formas de Pagamento',
      icon: <PaymentIcon />,
    },
    {
      segment: 'condicoes-pagamento',
      title: 'Condições de Pagamento',
      icon: <AccountBalanceIcon />,
    },
    {
      kind: 'divider',
    },
    {
      kind: 'header',
      title: 'Localização',
    },
    {
      segment: 'paises',
      title: 'Países',
      icon: <PublicIcon />,
    },
    {
      segment: 'estados',
      title: 'Estados',
      icon: <MapIcon />,
    },
    {
      segment: 'cidades',
      title: 'Cidades',
      icon: <LocationCityIcon />,
    },
    {
      kind: 'divider',
    },
  ];

  const BRANDING = {
    title: 'Sistema Cantina',
    homeUrl: '/',
  };

  function useRouterNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const router = React.useMemo(() => {
      return {
        pathname: location.pathname,
        searchParams: new URLSearchParams(location.search),
        navigate: (path) => navigate(path),
      };
    }, [location.pathname, location.search, navigate]);

    return router;
  }

  function DashboardLayoutToolpad({ children }) {
    const router = useRouterNavigation();

    return (
      <AppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        router={router}
      >
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </AppProvider>
    );
  }

  export default DashboardLayoutToolpad;

