const handleCursor = (mainWindow, store) => {
// Do any necessary js/css injections after load
  mainWindow.webContents.on('did-finish-load', () => {
    const contents = mainWindow.webContents;

    // Hide the cursor when browsing the configured content
    if (store.get('kiosk.browsingContent')) {
      const hideCursor = store.get('kiosk.cursorVisibility');
      let inactivityDelay = 0;
      const hideCursorCSS = 'html, body, *{ cursor: none !important;}';

      switch (hideCursor) {
        case 'show':
          // Do nothing. Use default cursor styles.
          break;
        case 'hide':
          contents.insertCSS(hideCursorCSS);
          break;
        case 'hide_after_5':
          inactivityDelay = 5000;
        // Falls through
        case 'hide_after_60':
          if (inactivityDelay === 0) inactivityDelay = 60000;
          // Javascript injection for timed cursor hiding...
          /* eslint no-case-declarations: off */
          let js = 'let eCursorTimeout = {}; ';
          js += 'const eStylesheet = document.styleSheets[0]; ';
          js += `let eRuleIndex = eStylesheet.insertRule("${hideCursorCSS}", 0); `;
          js += 'window.addEventListener("mousemove", () => { ';
          js += 'clearTimeout(eCursorTimeout); ';
          js += 'if (eRuleIndex >= 0) { eStylesheet.deleteRule(eRuleIndex); eRuleIndex = -1; } ';
          js += 'eCursorTimeout = setTimeout( () => { ';
          js += `eRuleIndex = eStylesheet.insertRule("${hideCursorCSS}", 0); `;
          js += `}, ${inactivityDelay}`;
          js += ') }, true)';
          contents.executeJavaScript(js);
          break;
        default:
          console.warn('[Warning] Cursor visibility selection not recognized.');
      }
    }
  });
};

export default handleCursor;
