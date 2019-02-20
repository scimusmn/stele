// Install extra Chrome dev tools to help us debug our React app
const installExtensions = async () => {
  if (
    process.env.NODE_ENV === 'development'
    || process.env.DEBUG_PROD === 'true'
  ) {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return Promise
      .all(
        extensions.map(name => installer.default(installer[name], forceDownload)),
      )
      .catch(console.log);
  }
  return null;
};

export default installExtensions;
