import { Alert, AlertTitle, Box, Snackbar, styled } from '@mui/material';
import { ipcRenderer, shell } from 'electron';

import AppStrings from '../lib/strings';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Head from 'next/head';
import InfoSnackbar from '../components/InfoSnackbar';
import InitDialog from '../components/InitDialog';
import Link from '../components/Link';
import React from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import changePage from '../lib/page-transition';

const Root = styled('div')(({ theme }) => {
    return {
        textAlign: 'center',
        padding: theme.spacing(4),
    };
})


function Home() {
    const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

    function LoginDialog() {
        let [username, setUsername] = React.useState('none');
        let [password, setPassword] = React.useState('none');
        const [snackbarOpen, setSnackbarOpen] = React.useState(false);

        const handleLogin = () => {
            ipcRenderer.send('mesg-db-auth-user',
                { username: username, password: password });
            ipcRenderer.once('reply-db-auth', (_, arg) => {
                if (arg) {
                    changePage('/overview');
                } else {
                    setSnackbarOpen(true);
                }
            });
        };

        return (
            <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
                <DialogTitle>{AppStrings.homeLogin}</DialogTitle>
                <InfoSnackbar
                    openState={snackbarOpen}
                    setOpenState={setSnackbarOpen}
                    severity="error"
                    title="Login Failed"
                    message="Please check your credentials and try again."
                />
                <DialogContent>
                    <DialogContentText>
                        {AppStrings.homeLoginDialogText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        autoComplete="current-password"
                        variant="standard"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleLogin}>
                        {AppStrings.homeLogin}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <React.Fragment>
            <Head>
                <title>{AppStrings.appName}</title>
            </Head>
            <Root>
                <LoginDialog />
                <InitDialog />
                <Typography variant="h4" gutterBottom>
                    {AppStrings.appName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    {AppStrings.appSubtitle}
                </Typography>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <img src='/images/logo_simple.svg' />
                </Box>
                {/* Align box to bottom of page */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        m: 2,
                    }}
                >
                    <Typography gutterBottom>
                        <Link href="" onClick={() => {
                            shell.openExternal("https://github.com/alexaib2002/dam2-final-project");
                        }}>{AppStrings.homeAbout}</Link>
                    </Typography>
                    <Button
                        sx={{
                            width: '50%',
                        }}
                        variant="contained"
                        onClick={() => setLoginDialogOpen(true)}>
                        {AppStrings.homeLogin}
                    </Button>
                </Box>
            </Root>
        </React.Fragment>
    );
};

export default Home;
