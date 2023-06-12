import { Alert, AlertTitle, Snackbar } from "@mui/material";

function InfoSnackbar({ openState, setOpenState, severity, title, message }) {
    return (
        <Snackbar open={openState} autoHideDuration={3000}
            onClose={() => setOpenState(false)}>
            <Alert severity={severity}
                onClose={() => setOpenState(false)}>
                <AlertTitle>{title}</AlertTitle>
                {message}
            </Alert>
        </Snackbar>
    );
}

export default InfoSnackbar;