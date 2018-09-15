# Stele

<img align="right" alt="Image of a Maya stele at Copan, by Frederick Catherwood" src="/resources/copan.png" />

Wrapper application for the [Electron runtime](http://electron.atom.io), focused on museum kiosk use.

This app is meant to serve as a kiosk wrapper that simply views an existing and separate web application.

# Setup

Clone the repo and run `npm install`

## Define the startup page
When the app launches it will navigate to a local or remote web path. Define this destination with a config file.

    mkdir -p /usr/local/etc/kiosk
    cp /usr/local/src/electron-wrapper/config/kiosk.config.example.json /usr/local/etc/kiosk/config.json

Edit the example kiosk file to define a URL for the kiosk to launch.

### URL examples:

A remote URL on the internet `http://www.example.org`

A static file on the local filesystem: `file:///Users/exhibits/src/app-dir/index.html`

A local server port `http://localhost:3000`

# Usage
Once you setup the app you can run it in two modes, development or production.

## Dev mode
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    npm start

## Production mode
In production mode we will build the wrapper into an app which we will run from the /Applications directory. In this mode the app will display fullscreen, preventing you from switching to an other application, viewing the dock, or the menubar. The console/inspector is not available in the production mode.

### Build production app
If you've made changes to the application and are ready to release a new version, first change the version number in the `/app/package.json` file. Then build the application with:

    npm run release

This will save a OS specific installer in `dist`.

# Keyboard shortcuts
When running the application you can use a few keyboard shortcuts to control the program. This can be useful
when debugging a kiosk application in an exhibit.

| Shortcut | Action | Windows | Linux | Mac OS |
| ------------- | ------------- | --- | --- | --- |
| Ctrl/Cmd+R  | Reload page  | X | X | X |
| Ctrl/Cmd+F  | Open Finder  | O | O | X |

# Credit
## What's a Stele?
> A stele (/ˈstiːli/ STEE-lee) is a stone or wooden slab, generally taller than it is wide, erected in the ancient world as a monument.

https://en.wikipedia.org/wiki/Stele

We initially began developing this software during the production of the Science Museum of Minnesota's exhibit on the Maya people, "[Maya: Hidden Worlds Revealed](https://www.smm.org/exhibitrental/maya-hidden-worlds-revealed)." Our physical kiosks for that exhibit drew upon the design of the Maya stelae, inspiring the software name.

## Upstream
This project's structure was initially generated using [szwacz's great electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

