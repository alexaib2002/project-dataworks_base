import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Tab, Tabs, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import React from "react";
import { ipcRenderer } from "electron";

function TabContainer() {
    const [tabValue, setTabValue] = React.useState(-1);
    const [tabs, setTabs] = React.useState([]);
    const [tabFields, setTabFields] = React.useState([]);
    const [rows, setRows] = React.useState(Array<any>());

    // Requests the tables of the database. Updates once on page load.
    React.useEffect(() => {
        const updateTabs = () => {
            ipcRenderer.send('mesg-db-get-tables');
            ipcRenderer.once('reply-db-get-tables', (_, dbTables) => {
                setTabs(dbTables);
                setTabValue(0); // update tab value so field update is triggered
            });
        };
        updateTabs();
    }, []);

    // Requests the fields of the selected DB table. Updates every time tabValue changes.
    React.useEffect(() => {
        const updateTabFields = () => {
            ipcRenderer.send('mesg-db-get-fields', { table: tabs[tabValue] });
            ipcRenderer.once('reply-db-get-fields', (_, fields) => {
                setTabFields(fields);
            });
        };
        if (tabValue >= 0) updateTabFields();
    }, [tabValue]);

    // Request the rows of the selected DB table. Updates every time tabValue changes.
    React.useEffect(() => {
        const updateRows = () => {
            ipcRenderer.send('mesg-db-get-registries', { table: tabs[tabValue] });
            ipcRenderer.once('reply-db-get-registries', (_, dbRows) => {
                setRows(dbRows);
            });
        };
        updateRows();
    }, [tabValue]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };


    function TabsSelector() {
        return (
            <Tabs
                scrollButtons="auto"
                value={tabValue}
                onChange={handleTabChange}
                centered
            >
                {tabs.map((table: string) => <Tab label={table} key={table} />)}
            </Tabs>
        );
    }

    function DataDisplay(props: any) {
        const { tabId } = props;

        const columns: GridColDef[] = tabFields.map((col: any) => col.name)
            .map((dbField: string) => {
                return {
                    field: dbField,
                    headerName: dbField.toUpperCase(),
                    width: 150,
                    editable: true,
                };
            });

        function DataControlButtons() {
            const [addDialogOpen, setAddDialogOpen] = React.useState(false);
            const [delDialogOpen, setDelDialogOpen] = React.useState(false);

            function AdditionDialog() {
                const closeDialog = () => setAddDialogOpen(false);
                return (
                    <Dialog open={addDialogOpen} onClose={closeDialog}>
                        <DialogTitle>Add new entry</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Fill the fields below to add a new entry to the database.
                            </DialogContentText>
                            <Box
                                component="form"
                                autoComplete='off'
                            >
                                {tabFields.map((field: any) => {
                                    const dbField: string = field.name;
                                    const [error, setError] = React.useState(false);
                                    const validateContent = (event) => {
                                        const value = event.target.value;
                                        if (!value && field.notnull === 1) {
                                            setError(true);
                                        } else {
                                            setError(false);
                                        }
                                    };
                                    if (field.pk || dbField === 'active') return;
                                    // Capitalize first letter of field name
                                    let label = dbField.slice(0, 1).toUpperCase() + dbField.slice(1);
                                    return (
                                        <TextField
                                            required={field.notnull === 1}
                                            error={error}
                                            helperText={error ? 'This field cannot be empty' : ''}
                                            margin="dense"
                                            id={dbField}
                                            key={dbField}
                                            label={label}
                                            type={field.type === 'INTEGER' ? 'number' : 'text'}
                                            fullWidth
                                            variant="standard"
                                            onChange={validateContent}
                                            onFocus={validateContent}
                                        />
                                    );
                                })}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={undefined}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            }

            function DeletionDialog() {
                const closeDialog = () => setDelDialogOpen(false);

                const handleDeletion = () => {
                    const selectedIds: number[] = rows.filter((row) => row.selected).map((row) => row.id);
                    ipcRenderer.send('mesg-db-disable-registries', { table: tabs[tabValue], ids: selectedIds });
                    ipcRenderer.once('reply-db-disable-registries', (_, success) => {
                        if (success) {
                            closeDialog();
                        } else {
                            // TODO Show error message
                        }
                    });
                };

                return (
                    <Dialog open={delDialogOpen} onClose={closeDialog}>
                        <DialogTitle>Delete entries</DialogTitle>
                        <DialogContent>
                            Do you really want to delete the selected items?
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={handleDeletion}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            }

            return (
                <Box
                    sx={{
                        padding: '10px',
                    }}
                >
                    <AdditionDialog />
                    <DeletionDialog />
                    <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                        <Grid item>
                            <Button variant="contained" color="primary" endIcon={<AddIcon />}
                                onClick={() => setAddDialogOpen(true)}>
                                Add item
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" endIcon={<DeleteIcon />}
                                onClick={() => setDelDialogOpen(true)}>
                                Delete selection
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            );
        }

        return (
            <div
                hidden={tabId !== tabValue}
            >
                <Grid container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}>
                    <DataControlButtons />
                    <Grid item xs={12}>
                        <Box sx={{ height: '100%', width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                pageSizeOptions={[5]}
                                checkboxSelection
                                disableRowSelectionOnClick
                            />
                        </Box>
                    </Grid>
                </Grid>
            </div>
        );
    }

    return (
        <Box>
            <TabsSelector />
            <Box padding={3}>
                {tabs.map((_, index) => <DataDisplay key={index} tabId={index} />)}
            </Box>
        </Box>
    )
}

export default TabContainer;