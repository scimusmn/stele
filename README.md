# Stele

<img align="right" alt="Image of a Maya stele at Copan, by Frederick Catherwood" src="/resources/copan.png" />

Wrapper application for the [Electron runtime](http://electron.atom.io), focused on museum kiosk use.

This app is meant to serve as a kiosk wrapper that simply views an existing web application.

Download the [latest release for Windows, Linux, or macOS](https://github.com/scimusmn/stele/releases/latest).

# Setup

Clone the repo and run `yarn`

# Usage
Once you setup the app you can run it in two modes, development or production.

## Development mode
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    yarn dev

## Production mode
In production mode the application is compiled for the appropriate operating system. When this compiled binary is run, the application will display fullscreen in your operating system's kiosk mode.

**WARNING**: Running the application in production can prevent you from switching out of the application. Use the [keyboard shortcuts](#keyboard-shortcuts) to exit the app in kiosk mode.

### Build production app
If you've made changes to the application and are ready to release a new version, first change the version number in the `/app/package.json` file. Then build the application with:

    yarn package

This will save either a `.dmg` (macOS), `.exe` (Windows 10), or an `.AppImage` (Linux) in the `release` directory.

## Change kiosk URL
When you start the app, and no URL is set, you will be directed to the settings page to enter a URL for your kiosk view.

When operating the app in kiosk mode use the `Cmd`+`,` keyboard shortcut to access the settings page.

# Keyboard shortcuts
When running the application you can use a few keyboard shortcuts to control the program. This can be useful when debugging a kiosk application in an exhibit.

| Shortcut | Action                       | Windows | Linux | macOS |
| ---      | ---                          | ---     | ---   | ---   |
| Ctrl + , | Settings page                | ✓       | ✓     | 𐄂     |
| Cmd + ,  | Settings page                | 𐄂       | 𐄂     | ✓     |
| Ctrl + R | Reload page                  | ✓       | ✓     | 𐄂     |
| Cmd + R  | Reload page                  | 𐄂       | 𐄂     | ✓     |
| Ctrl + H | Hide application<sup>*</sup> | ✓       | ✓     | ✓     |
| Ctrl + Q | Quit application             | ✓       | ✓     | ✓     |
| Cmd + Q  | Quit application             | 𐄂       | 𐄂     | ✓     |

\* Hide application works on Windows. On Linux and Mac, we simply open the file explorer, pushing the Stele application into the background.

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
