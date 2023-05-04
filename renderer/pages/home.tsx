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
import {Alert, AlertTitle, Snackbar, styled} from '@mui/material';
import {shell} from 'electron';

const Root = styled('div')(({theme}) => {
    return {
        textAlign: 'center',
        paddingTop: theme.spacing(4),
    };
})


function Home() {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);

    const handleLogin = () => {
        // TODO authenticate against DB
        // FIXME some little warnings so users know this won't work yet
        setDialogOpen(false);
        setSnackbarOpen(true);

    };
    const handleClick = () => setDialogOpen(true);

    function InfoSnackbar() {
        return (
            <Snackbar open={snackbarOpen} autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}>
                    <Alert severity="warning"
                        onClose={() => setSnackbarOpen(false)}>
                            <AlertTitle>Warning</AlertTitle>
                            DB authentication not implemented yet - sorry!
                    </Alert>
                </Snackbar>
        );
    }

    function LoginDialog() {
        return (
            <Dialog open={dialogOpen} onClose={handleLogin}>
                <DialogTitle>Login</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please input your credentials in the form above.
                        If you don't have an account, please contact an admin.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
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
                        autoComplete="current-password"
                        variant="standard"
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
                <InfoSnackbar />
                <Typography variant="h4" gutterBottom>
                    DataWorks
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Making data management solutions that actually work!
                </Typography>
                <img src="/images/logo.png"/>
                <Typography gutterBottom>
                    <Link href="" onClick={() => {
                        shell.openExternal("https://github.com/alexaib2002/dam2-final-project");
                    }}>About</Link>
                </Typography>
                <Button variant="contained" color="secondary"
                    onClick={handleClick}>
                        Login
                </Button>
            </Root>
        </React.Fragment>
    );
};

export default Home;
