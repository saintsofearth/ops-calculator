const { contextBridge, ipcRenderer } = require('electron');

console.log(`preload js file included`);

contextBridge.exposeInMainWorld(
    'api',
    {
        send: (channel, data) => {
            // Whitelist channels
            let validChannels = ['toMain', 'toInitialWindow', 'toFinalWindow', 'toDetailWindow'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ['fromMain'];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);