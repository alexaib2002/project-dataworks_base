import React from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Link from '../components/Link';
import { Alert, AlertTitle, Snackbar, styled } from '@mui/material';
import { shell, ipcRenderer } from 'electron';
import changePage from '../lib/page-transition';

const Root = styled('div')(({ theme }) => {
    return {
        textAlign: 'center',
        paddingTop: theme.spacing(4),
    };
})


function Home() {
    const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
    const [initDialogOpen, setInitDialogOpen] = React.useState(false);

    React.useEffect(() => {
        ipcRenderer.send('mesg-db-get-registries', { table: 'user' });
        ipcRenderer.once('reply-db-get-registries', (_, dbRows) => {
            if (dbRows.length == 0)
                setLoginDialogOpen(true);
        });
    }, []);

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

        function InfoSnackbar() {
            return (
                <Snackbar open={snackbarOpen} autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}>
                    <Alert severity="error"
                        onClose={() => setSnackbarOpen(false)}>
                        <AlertTitle>Invalid credentials</AlertTitle>
                        Incorrect username or password. Please try again.
                    </Alert>
                </Snackbar>
            );
        }

        return (
            <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
                <DialogTitle>Login</DialogTitle>
                <InfoSnackbar />
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

    function InitDialog(props: any) {
        const handleInit = () => {
            const email = document.getElementById('username') as HTMLInputElement;
            const password = document.getElementById('password') as HTMLInputElement;
            ipcRenderer.send('mesg-db-create-user', { email: email.value, password: password.value });
            ipcRenderer.once('reply-db-create-user', (_, success) => {
                if (success) {
                    setInitDialogOpen(false);
                } else {
                    // TODO Show error message
                }
            });
        };

        return (
            <Dialog open={initDialogOpen} onClose={() => setInitDialogOpen(false)}>
                <DialogTitle>Setup DB</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Hi! Looks like this is your first time using DataWorks.
                        Please enter the credentials for the admin user below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Email Address"
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
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleInit}>
                        Continue
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
