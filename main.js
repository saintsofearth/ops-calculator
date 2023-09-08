const electron = require('electron');
const path = require('path');
const url = require('url');

const { app, BrowserWindow, ipcMain } = electron;

let initialWindow;
let detailsWindow;
let finalWindow;

// All event listeners
app.on('ready', createInitialWindow);

ipcMain.on('toMain', (event, data) => {
    console.log(data);
    if (data.requestType === 'forward') {
        initialWindow.hide();
        createDetailsWindow();
        detailsWindow.webContents.on('did-finish-load', () => {
            detailsWindow.webContents.send('fromMain', data);
        });
    } else if (data.requestType === 'exit') {
        app.quit();
    }
    
});

// ipcMain.on('')

ipcMain.on('toInitialWindow', (event, data) => {
    console.log('Moving back to initial window');
    if (data.requestType === 'new mission') {
        finalWindow.close();
        finalWindow = null;
    } else if (data.requestType === 'previous window') {
        detailsWindow.close();
        detailsWindow = null;
    }
    initialWindow.show();
})

ipcMain.on('toDetailWindow', (event, data) => {
    console.log('Moving back to details window');
    finalWindow.close();
    finalWindow = null;
    detailsWindow.show();
}) 

ipcMain.on('toFinalWindow', (event, data) => {
    console.log(`Moving to final window with this data`);
    console.log(data);
    detailsWindow.hide();
    createFinalWindow();
    finalWindow.webContents.on('did-finish-load', () => {
        finalWindow.webContents.send('fromMain', data);
    });
});




// All events handling
function createInitialWindow() {
    console.log(`create initial window invoked`);
    initialWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            preload: `${__dirname}/preload.js`
        },
        icon: `${__dirname}/resources/img/calculator.png`
    });

    initialWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'initialWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    initialWindow.title = 'home';

    console.log(initialWindow.title);


    initialWindow.on('closed', function () {
        app.quit();
    });

    // Custom Menu
}

function createDetailsWindow() {

    detailsWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            preload: `${__dirname}/preload.js`
        },
        icon: `${__dirname}/resources/img/calculator.png`
    });

    detailsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'detailsWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    detailsWindow.title = 'middle';

}

function createFinalWindow() {
    finalWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            preload: `${__dirname}/preload.js`
        },
        icon: `${__dirname}/resources/img/calculator.png`
    });

    finalWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'finalWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    finalWindow.title = 'final';
}