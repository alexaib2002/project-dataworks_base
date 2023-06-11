/**
 * ResponsiveAppBar component
 * Base code came from public MUI example:
 * 	https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu
 */

import * as React from 'react';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import changePage from '../lib/page-transition';
import { ipcRenderer } from 'electron';

const appSettings = ['Create DB user'];
const userSettings = ['Account', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [usrDialogOpen, setUsrDialogOpen] = React.useState(false);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const parseNavActionMenu = (action: string) => {
    handleCloseNavMenu();
    switch (action) {
      case appSettings[0]: {
        setUsrDialogOpen(true);
        break;
      }
    }
  }

  const parseUserActionMenu = (action: string) => {
    handleCloseUserMenu();
    switch (action) {
      case userSettings[0]: {
        break;
      }
      case userSettings[1]: {
        // TODO logout user
        changePage('/home');
        break;
      }
    }
  }

  function UserCreationDialog() {
    const closeDialog = () => setUsrDialogOpen(false);

    const handleUserCreation = () => {
      const email = document.getElementById('field') as HTMLInputElement;
      const password = document.getElementById('password') as HTMLInputElement;
      ipcRenderer.send('mesg-db-create-user', { email: email.value, password: password.value });
      ipcRenderer.once('reply-db-create-user', (_, success) => {
        console.log(success);
        if (success) {
          closeDialog();
        } else {
          // TODO Show error message
        }
      });
    };

    return (
      <Dialog open={usrDialogOpen} onClose={closeDialog}>
        <DialogTitle>Add a new database user</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="field"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            autoComplete="current-password"
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleUserCreation}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function AppLogo() {
    return (
      <Box sx={{
        my: 1,
      }}>
        <img src="/images/logo_extended.svg" height={50} />
      </Box>
    );
  }

  return (
    <AppBar position="sticky" sx={{ top: 0, bottom: 'auto' }}>
      <UserCreationDialog />
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Collapsed state items */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AppLogo />
            </Box>
            {/* Collapsed state hamburger menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {appSettings.map((page) => (
                <MenuItem key={page} onClick={() => parseNavActionMenu(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* Extended state items */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <AppLogo />
            {appSettings.map((page) => (
              <Button
                key={page}
                onClick={() => parseNavActionMenu(page)}
                sx={{
                  my: 2,
                  mx: 1,
                  color: 'white',
                  display: 'block'
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {/* Placeholder avatar data */}
                <Avatar alt="User" src="" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting) => (
                <MenuItem key={setting} onClick={() => parseUserActionMenu(setting)}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
