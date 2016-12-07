# electron-wrapper

Wrapper application for the [Electron runtime](http://electron.atom.io), focused on museum kiosk use.

This app is meant to serve as a kiosk wrapper that simply views an existing and separate web application.

# Setup

## Get the source code

    mkdir -p /usr/local/src # Just a recommended location
    cd /usr/local/src
    git clone https://github.com/scimusmn/electron-wrapper.git
    cd electron-wrapper
    npm install

## Define the startup page
When the app launches it will navigate to a local or remote web path. Define this destination with a config file.

    mkdir -p /usr/local/etc/kiosk
    cp /usr/local/src/electron-wrapper/config/kiosk.config.example.json /usr/local/etc/kiosk/config.json

Edit the example kiosk file to define a URL for the kiosk to launch.

### URL examples:

A remote URL on the internet
    http://www.example.org

A static file on the local filesystem
    file:///Users/exhibits/src/app-dir/index.html

A local server port
    http://localhost:3000

# Usage
Once you setup the app you can run it in two modes, development or production.

## Dev mode
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    cd /usr/local/src/electron-wrapper/
    npm start

## Production mode
In production mode we will build the wrapper into an app which we will run from the /Applications directory. In this mode the app will display fullscreen, preventing you from switching to an other application, viewing the dock, or the menubar. The console/inspector is not available in the production mode.

### Build production app
If you've made changes to the application and are ready to release a new version, first change the version number in the `/app/package.json` file. Then build the application with:

    cd /usr/local/src/electron-wrapper/
    npm run release

This will save a new `.dmg` installer in `releases`.

# Keyboard shortcuts
When running the application you can use a few keyboard shortcuts to control the program. This can be useful
when debugging a kiosk application in an exhibit.

| Shortcut | Action | Linux | Windows | Mac OS |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| Ctrl/Cmd + R | Reload the current page | X | X | X |
| Ctrl/Cmd + F  | Open Finder | O | O | X |

# Credit
This is a fork of [szwacz's great electron-boilerplate](https://github.com/szwacz/electron-boilerplate). Our internal needs are just unique/different enough, that it make sense to set up our own version.
