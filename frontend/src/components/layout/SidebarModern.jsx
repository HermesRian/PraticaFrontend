/*
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Collapse,
  IconButton,
  Toolbar,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  Public as PublicIcon,
  LocationOn as LocationOnIcon,
  LocationCity as LocationCityIcon,
  Inventory as InventoryIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const drawerWidth = 280;
const collapsedWidth = 56;

const SidebarModern = ({ open, onToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expandedSections, setExpandedSections] = useState({
    cadastros: true,
    financeiro: true,
    localizacao: true,
  });

  const handleExpandClick = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      type: 'single',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      type: 'section',
      title: 'Cadastros',
      key: 'cadastros',
      items: [
        { title: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
        { title: 'Fornecedores', icon: <BusinessIcon />, path: '/fornecedores' },
        { title: 'Funcionários', icon: <WorkIcon />, path: '/funcionarios' },
      ],
    },
    {
      type: 'section',
      title: 'Financeiro',
      key: 'financeiro',
      items: [
        { title: 'Formas de Pagamento', icon: <PaymentIcon />, path: '/formas-pagamento' },
        { title: 'Condições de Pagamento', icon: <AccountBalanceIcon />, path: '/condicoes-pagamento' },
      ],
    },
    {
      type: 'section',
      title: 'Localização',
      key: 'localizacao',
      items: [
        { title: 'Países', icon: <PublicIcon />, path: '/paises' },
        { title: 'Estados', icon: <LocationOnIcon />, path: '/estados' },
        { title: 'Cidades', icon: <LocationCityIcon />, path: '/cidades' },
      ],
    },
    {
      type: 'single',
      title: 'Produtos',
      icon: <InventoryIcon />,
      path: '/produtos',
    },
  ];

  const renderSingleItem = (item) => (
    <ListItem key={item.title} disablePadding>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActive(item.path)}
        sx={{
          pl: open ? 2 : 1.5,
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
            color: isActive(item.path) ? 'white' : 'inherit',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          sx={{
            opacity: open ? 1 : 0,
            '& .MuiTypography-root': {
              fontSize: '0.875rem',
              fontWeight: isActive(item.path) ? 600 : 400,
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  const renderSection = (section) => {
    const isExpanded = expandedSections[section.key];
    
    return (
      <Box key={section.title}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleExpandClick(section.key)}
            sx={{
              pl: open ? 2 : 1.5,
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {section.title}
                </Typography>
              }
              sx={{ opacity: open ? 1 : 0 }}
            />
            {open && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={open && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {section.items.map((item) => (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    pl: 4,
                    minHeight: 40,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                      color: isActive(item.path) ? 'white' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={isMobile ? onToggle : undefined}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          bgcolor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          minHeight: '64px !important',
        }}
      >
        {open && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Sistema Cantina
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} size="small">
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Toolbar>
      
      <Divider />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          if (item.type === 'single') {
            return renderSingleItem(item);
          } else if (item.type === 'section') {
            return renderSection(item);
          }
          return null;
        })}
      </List>
    </Drawer>
  );
};

export default SidebarModern;
*/
