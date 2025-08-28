/*

import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Drawer
    variant="permanent"
    sx={{
      width: 240,
      flexShrink: 0,
      zIndex: 1000, // Certifique-se de que seja menor que o z-index do modal
      '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
        marginTop: '64px',
      },
    }}
    >
      <List>
        <ListItem component={Link} to="/clientes" button>
          <ListItemText primary="Clientes" />
        </ListItem>

        <ListItem component={Link} to="/fornecedores" button>
          <ListItemText primary="Fornecedores" />
        </ListItem>

        <ListItem component={Link} to="/funcionarios" button>
          <ListItemText primary="Funcionários" />
        </ListItem>

        <ListItem component={Link} to="/formas-pagamento" button>
          <ListItemText primary="Formas de Pagamento" />
        </ListItem>

        <ListItem component={Link} to="/condicoes-pagamento" button>
          <ListItemText primary="Condições de Pagamento" />
        </ListItem>

        <ListItem component={Link} to="/paises" button>
          <ListItemText primary="Países" />
        </ListItem>

        <ListItem component={Link} to="/estados" button>
          <ListItemText primary="Estados" />
        </ListItem>

        <ListItem component={Link} to="/cidades" button>
          <ListItemText primary="Cidades" />
        </ListItem>

       { /*
        <ListItem component={Link} to="/produtos" button>
          <ListItemText primary="Produtos" />
        </ListItem>
    */  /* }
        </List>
    </Drawer>
  );
};

*/
//export default Sidebar;