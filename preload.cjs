const { contextBridge } = require('electron');

const versionArgument = process.argv.find((argument) => argument.startsWith('--app-version='));
const version = versionArgument ? versionArgument.slice('--app-version='.length) : 'unknown';

contextBridge.exposeInMainWorld('playroomApp', Object.freeze({ version }));

