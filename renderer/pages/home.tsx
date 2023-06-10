import { Alert, AlertTitle, Snackbar, styled } from '@mui/material';
import { ipcRenderer, shell } from 'electron';

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
        paddingTop: theme.spacing(4),
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
                <DialogTitle>Login</DialogTitle>
                <InfoSnackbar
                    openState={snackbarOpen}
                    setOpenState={setSnackbarOpen}
                    severity="error"
                    title="Login Failed"
                    message="Please check your credentials and try again."
                />
                <DialogContent>
                    <DialogContentText>
                        Please input your credentials in the form above.
                        If you don't have an account, please contact an admin.
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
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <React.Fragment>
            <Head>
                <title>DataWorks</title>
            </Head>
            <Root>
                <LoginDialog />
                <InitDialog />
                <Typography variant="h4" gutterBottom>
                    DataWorks
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Making data management solutions that actually work!
                </Typography>
                <img src='/images/logo_simple.svg' />
                <Typography gutterBottom>
                    <Link href="" onClick={() => {
                        shell.openExternal("https://github.com/alexaib2002/dam2-final-project");
                    }}>About</Link>
                </Typography>
                <Button variant="contained" color="secondary"
                    onClick={() => setLoginDialogOpen(true)}>
                    Login
                </Button>
            </Root>
        </React.Fragment>
    );
};

export default Home;
