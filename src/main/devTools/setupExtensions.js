//
// Install extra Chrome dev tools to help debug the renderer React app
//
const setupExtensions = async () => {
  /* eslint global-require: off */
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise
    .all(
      extensions.map(name => installer.default(installer[name], forceDownload)),
    )
    .catch(console.log);
};

export default setupExtensions;
