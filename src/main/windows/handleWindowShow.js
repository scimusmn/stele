const handleWindowShow = (window) => {
  window.once('ready-to-show', () => {
    window.show();
  });
};

export default handleWindowShow;
