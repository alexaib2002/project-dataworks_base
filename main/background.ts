import { app, ipcMain } from 'electron';
import { createWindow, dbManager } from './helpers';

import serve from 'electron-serve';

const isProd: boolean = process.env.NODE_ENV === 'production';

const closeApp = () => {
  dbManager.closeDb();
  app.quit();
};

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.whenReady().then(() => {
  dbManager.initDb().then(() => {
    console.log('Connected to DB');
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-auth-user', (event, args) => {
  dbManager.getRegistry('user', ['username', 'password'], [{ what: 'username', filter: args.username }])
    .then((res) => {
      if (!res) {
        event.reply('reply-db-auth', false);
        return;
      }
      event.reply('reply-db-auth', args.username === res.username && args.password === res.password);
    }).catch((err) => {
      console.log(err);
    });
});

ipcMain.on('mesg-db-create-user', (event, args) => {
  dbManager.insertRegistry('user', ['username', 'password'], [args.email, args.password])
    .then((_) => {
      event.reply('reply-db-create-user', true);
    }).catch((err) => {
      console.log(err);
      event.reply('reply-db-create-user', false);
    });
});

ipcMain.on('mesg-db-get-tables', (event, _) => {
  dbManager.getTables().then((res) => {
    event.reply('reply-db-get-tables', res);
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-get-fields', (event, args) => {
  dbManager.getCols(args.table).then((res) => {
    event.reply('reply-db-get-fields', res);
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-get-registry', (event, args) => {
  dbManager.getRegistry(args.table, [], args.where).then((res) => {
    event.reply('reply-db-get-registry', res);
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-get-registries', (event, args) => {
  // select all registries from table
  dbManager.getRegistry(args.table, [], [], true).then((res) => {
    event.reply('reply-db-get-registries', res);
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-get-fk-table', (event, args) => {
  dbManager.getForeignKey(args.table, args.fk).then((res) => {
    event.reply('reply-db-get-fk-table', res);
  }).catch((err) => {
    console.log(err);
  });
});

ipcMain.on('mesg-db-disable-registries', (event, args) => {
  args.ids.forEach(id => {
    (async () => {
      await dbManager
        .updateRegistry(args.table, ['active'], ['0'],
          [{ what: 'id', filter: id }]).then((_) => {
            console.log(`Disabled ${id}`)
          }).catch((err) => {
            console.log(err);
          });
    })().then(() => {
      event.reply('reply-db-disable-registries', true);
    });
  })
});

app.on('window-all-closed', closeApp);
