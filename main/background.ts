import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow, dbManager } from './helpers';

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
  dbManager.getRegistry('users', ['username', 'password'], `username LIKE '${args.username}'`)
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

app.on('window-all-closed', closeApp);
