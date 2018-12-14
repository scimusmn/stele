# Stele

<img align="right" alt="Image of a Maya stele at Copan, by Frederick Catherwood" src="/resources/copan.png" />

Wrapper application for the [Electron runtime](http://electron.atom.io), focused on museum kiosk use.

This app is meant to serve as a kiosk wrapper that simply views an existing web application.

# Setup

Clone the repo and run `yarn`

# Usage
Once you setup the app you can run it in two modes, development or production.

## Development mode
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    yarn dev

## Production mode
In production mode the application is compiled for the appropriate operating system. When this compiled binary is run, the application will display fullscreen, preventing you from switching to an other application, viewing the dock, or the menubar. The console/inspector is not available in the production mode.

**WARNING**: Running the application in production can lock you out of your computer unless you have a remote way to quit the Stele application. We're working on keyboard shortcuts for Linux and Windows, to allow you to exit the application. On macOS, use the [keyboard shortcut](#keyboard-shortcuts) to switch to the Finder, when you need to exit the application.

### Build production app
If you've made changes to the application and are ready to release a new version, first change the version number in the `/app/package.json` file. Then build the application with:

    yarn package

This will save a OS specific installer in `release`.

We also include [binaries for each OS in the latest release](https://github.com/scimusmn/stele/releases/latest).

#### Linux
If you are building a .deb on Linux you will likely need to install the `rpm` package. On Ubuntu, this would be done with:
```bash
sudo apt-get install rpm
```

## Change kiosk URL
When you start the app, and no URL is set, you will be directed to the settings page to enter a URL for your kiosk view.

When operating the app in kiosk mode use the `Cmd`+`,` keyboard shortcut to access the settings page.

# Keyboard shortcuts
When running the application you can use a few keyboard shortcuts to control the program. This can be useful
when debugging a kiosk application in an exhibit.

| Shortcut | Action | Windows | Linux | Mac OS |
| ------------- | ------------- | --- | --- | --- |
| Ctrl/Cmd+,  | Settings page | O | O | X |
| Ctrl/Cmd+R  | Reload page  | X | X | X |
| Ctrl/Cmd+F  | Open Finder  | O | O | X |

# Credit
## What's a Stele?
> A stele (/ˈstiːli/ STEE-lee) is a stone or wooden slab, generally taller than it is wide, erected in the ancient world as a monument.

https://en.wikipedia.org/wiki/Stele

We initially began developing this software during the production of the Science Museum of Minnesota's exhibit on the Maya people, "[Maya: Hidden Worlds Revealed](https://www.smm.org/exhibitrental/maya-hidden-worlds-revealed)." Our physical kiosks for that exhibit drew upon the design of the Maya stelae, inspiring the software name.

## Upstream
This project's structure was initially generated using [szwacz's great electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

This webpack configuration is based off the [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate).

## Media
The image of a stele at [Copan](https://uncoveredhistory.com/honduras/copan/the-stelae-of-copan/) in this README is a public domain sketch by [Frederick Catherwood](https://en.wikipedia.org/wiki/Frederick_Catherwood).

The stele app icon is a modified version of [ Atif Ashrad's Touch Gestures icons ](https://thenounproject.com/atifarshad/collection/touch-gestures/) from the Noun Project, [(CC BY 2.0)](https://creativecommons.org/licenses/by/2.0/)
