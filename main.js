const electron = require("electron");
const path = require("path");
const fs = require("fs");

const { app, BrowserWindow, Menu, ipcMain, session } = electron;

let win;
// fun fact you can only have one preload file when sandboxed.
app.on("ready", () => {
  win = new BrowserWindow({
    width: 768,
    height: 1024,
    icon: path.join(__dirname, "icon.ico"),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile("home.html");
  win.removeMenu();
  win.once("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    app.quit();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

//git test comment
