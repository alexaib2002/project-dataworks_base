import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";

import React from "react";
import { ipcRenderer } from "electron";

function InitDialog() {
    const [initDialogOpen, setInitDialogOpen] = React.useState(false);
    const [cleared, setCleared] = React.useState(false);
    const fields = ["Email", "Password"];

    React.useEffect(() => {
        ipcRenderer.send('mesg-db-get-registries', { table: 'user' });
        ipcRenderer.once('reply-db-get-registries', (_, dbRows) => {
            if (dbRows.length == 0)
                setInitDialogOpen(true);
        });
    }, []);

    const validations = React.useMemo(() => {
        return {
            email: false,
            password: false
        }
    }, []);

    const handleInit = () => {
        const email = document.getElementById(fields[0].toLowerCase()) as HTMLInputElement;
        const password = document.getElementById(fields[1].toLowerCase()) as HTMLInputElement;
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
        <Dialog open={initDialogOpen}>
            <DialogTitle>Setup DB</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hi! Looks like this is your first time using DataWorks.
                    Please enter the credentials for the admin user below.
                </DialogContentText>
                {fields.map((id) => {
                    const capId = id;
                    id = id.toLowerCase();
                    const [error, setError] = React.useState(false);
                    const validateContent = (event) => {
                        const value = event.target.value;
                        const invalid = !value || value.length == 0;
                        setError(invalid);
                        validations[id] = !invalid;
                        setCleared(validations.email && validations.password);
                    };
                    return (
                        <TextField
                            autoFocus
                            margin="dense"
                            error={error}
                            id={id}
                            label={capId}
                            key={id}
                            type={id == "password" ? "password" : "text"}
                            fullWidth
                            variant="standard"
                            onChange={validateContent}
                        />
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleInit} disabled={!cleared}>
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InitDialog;