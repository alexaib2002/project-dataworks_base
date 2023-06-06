import { Box, Button, Grid, styled, Tab, Tabs } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Head from 'next/head';
import * as React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import { ipcRenderer } from 'electron';

const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    padding: theme.spacing(2),
  };
});

function Overview() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [delDialogOpen, setDelDialogOpen] = React.useState(false);
  const [usrDialogOpen, setUsrDialogOpen] = React.useState(false);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
      <div
        hidden={tabId !== tabValue}
      >
        <AdditionDialog />
        <DeletionDialog />
        <Grid container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={3}>
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
          <Grid item xs={12}>
            <Box sx={{ height: 400, width: '100%' }}>
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

  function TabContainer() {
    function TabsSelector() {
      return (
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          value={tabValue}
          onChange={handleTabChange}
        >
          {tabs.map((table: string) => <Tab label={table} key={table} />)}
        </Tabs>
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

  return (
    <React.Fragment>
      <Head>
        <title>Overview</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <ResponsiveAppBar dbUserDialogCallback={() => { setUsrDialogOpen(true) }} />
      <Root>
        <UserCreationDialog />
        <TabContainer />
      </Root>
    </React.Fragment>
  );
}

export default Overview;