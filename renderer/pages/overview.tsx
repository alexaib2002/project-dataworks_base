import { Box, Button, Grid, styled } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Head from 'next/head';
import * as React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    padding: theme.spacing(8),
  };
});
function Overview() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [delDialogOpen, setDelDialogOpen] = React.useState(false);
  const [usrDialogOpen, setUsrDialogOpen] = React.useState(false);

  function UserCreationDialog() {
    const closeDialog = () => setUsrDialogOpen(false);
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
          <Button color="primary" onClick={undefined}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function AdditionDialog() {
    const closeDialog = () => setAddDialogOpen(false);
    return (
      <Dialog open={addDialogOpen} onClose={closeDialog}>
        <DialogTitle>Add new entry</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/*
            User may want to have a customized prompt
            Thus this dialog should be dinamic, allowing the fields to adapt
            to their data type from the DB
            */}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="field"
            label="Field"
            type="text"
            fullWidth
            variant="standard"
          />
          {/* <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            autoComplete="current-password"
            variant="standard"
          /> */}
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
          <Button color="primary" onClick={undefined}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function DBTable() {
    return (
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
    );
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
      <ResponsiveAppBar dbUserDialogCallback={() => {setUsrDialogOpen(true)}} />
      <Root>
        <AdditionDialog />
        <DeletionDialog />
        <UserCreationDialog />
        <DBTable />
      </Root>
    </React.Fragment>
  );
}

export default Overview;