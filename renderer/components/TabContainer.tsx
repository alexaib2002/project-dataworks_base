import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Tab, Tabs, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridFilterModel, GridValidRowModel, useGridApiRef } from "@mui/x-data-grid";

import AppStrings from '../lib/strings';
import React from "react";
import RegistryPreview from './RegistryPreview';
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
        updateRows();
    }, [tabValue]);

    const updateRows = () => {
        ipcRenderer.send('mesg-db-get-registries', { table: tabs[tabValue] });
        ipcRenderer.once('reply-db-get-registries', (_, dbRows) => {
            setRows(dbRows);
        });
    };

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
        const apiRef = useGridApiRef();
        const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
            items: [
                { field: 'active', operator: 'equals', value: '1' },
            ],
        });

        const columns: GridColDef[] = tabFields.map((col: any) => col.name)
            .map((dbField: string) => {
                return {
                    field: dbField,
                    headerName: dbField.toUpperCase(),
                    width: 150,
                    editable: true,
                    valueSetter: (params: GridValidRowModel) => {
                        ipcRenderer.send('mesg-db-update-registry', {
                            table: tabs[tabValue],
                            field: [dbField],
                            value: [params.value],
                            where: [{ what: 'id', filter: params.row.id }],
                        });
                        params.row[dbField] = params.value;
                        return params.row;
                    },
                };
            });

        function DataControlButtons() {
            const [addDialogOpen, setAddDialogOpen] = React.useState(false);
            const [delDialogOpen, setDelDialogOpen] = React.useState(false);

            function AdditionDialog() {
                const closeDialog = () => setAddDialogOpen(false);

                const handleDataInsertion = () => {
                    const insertValues = tabFields.map((field: any) => {
                        const inputField = document.getElementById(field.name) as HTMLInputElement;
                        if (inputField)
                            return inputField.value;
                        return undefined;
                    }).filter((value: any) => value !== undefined);
                    insertValues.push("1"); // Enable the registry by default
                    ipcRenderer.send('mesg-db-insert-registry', {
                        table: tabs[tabValue],
                        fields: tabFields.map((field: any) => field.name)
                            .filter((field: string) => field !== 'id'),
                        values: insertValues,
                    });
                    ipcRenderer.once('reply-db-insert-registry', (_, success) => {
                        if (success) {
                            updateRows();
                            closeDialog();
                        }
                    });
                };

                return (
                    <Dialog open={addDialogOpen} onClose={closeDialog}>
                        <DialogTitle>{AppStrings.dataAddRegistryTitle}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {AppStrings.dataAddRegistrySubtitle}
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
                                    // TODO shouldn't check for id, but for foreign key in PRAGMA
                                    if (dbField.endsWith('id')) {
                                        const [fieldValue, setFieldValue] = React.useState('');
                                        return (
                                            <Box id={`${dbField}_boxcontainer`}>
                                                <TextField
                                                    required={field.notnull === 1}
                                                    error={error}
                                                    helperText={error ? 'This field cannot be empty' : ''}
                                                    margin="dense"
                                                    id={dbField}
                                                    key={dbField}
                                                    label={label}
                                                    value={fieldValue}
                                                    type={field.type === 'INTEGER' ? 'number' : 'text'}
                                                    fullWidth
                                                    variant="standard"
                                                    onChange={(event) => {
                                                        setFieldValue(event.target.value);
                                                        validateContent(event);
                                                    }}
                                                    onFocus={validateContent}
                                                />
                                                <RegistryPreview
                                                    key={`preview_${dbField}`}
                                                    fk={dbField}
                                                    fkval={fieldValue}
                                                    originTab={tabs[tabValue]}
                                                />
                                            </Box>
                                        );
                                    }
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
                                {AppStrings.systemCancel}
                            </Button>
                            <Button color="primary" onClick={handleDataInsertion}>
                                {AppStrings.systemConfirm}
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            }

            function DeletionDialog() {
                const closeDialog = () => setDelDialogOpen(false);

                const handleDeletion = () => {
                    const selectedIds: number[] = [];
                    apiRef.current.getSelectedRows()
                        .forEach((row: GridValidRowModel) => selectedIds.push(row.id));
                    ipcRenderer.send('mesg-db-disable-registries', { table: tabs[tabValue], ids: selectedIds });
                    ipcRenderer.once('reply-db-disable-registries', (_, success) => {
                        if (success) {
                            closeDialog();
                            updateRows();
                        } else {
                            // TODO Show error message
                        }
                    });
                };

                return (
                    <Dialog open={delDialogOpen} onClose={closeDialog}>
                        <DialogTitle>{AppStrings.dataDeleteRegistryTitle}</DialogTitle>
                        <DialogContent>
                            {AppStrings.dataDeleteRegistrySubtitle}
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={closeDialog}>
                                {AppStrings.systemCancel}
                            </Button>
                            <Button color="primary" onClick={handleDeletion}>
                                {AppStrings.systemConfirm}
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
                                {AppStrings.systemAdd}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" endIcon={<DeleteIcon />}
                                onClick={() => setDelDialogOpen(true)}>
                                {AppStrings.systemDelete}
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
                                apiRef={apiRef}
                                rows={rows}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                        },
                                    },
                                }}
                                pageSizeOptions={[10]}
                                checkboxSelection
                                disableRowSelectionOnClick
                                filterModel={filterModel}
                                onFilterModelChange={(model) => setFilterModel(model)}
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