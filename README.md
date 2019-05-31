# Stele

<img align="right" alt="Image of a Maya stele at Copan, by Frederick Catherwood" src="/resources/copan.png" />

Stele is an exhibit kiosk browser, built for the museum environment.

This app is meant to serve as a full-screen wrapper that simply views an existing web application.

Download the [latest release for Windows or macOS](https://github.com/scimusmn/stele/releases/latest).

# Install and setup
Detailed instructions for:

- [Windows 10](docs/install-win.md)
- [macOS](docs/install-mac.md)

# Keyboard shortcuts
**WARNING**: The application tries to enter kiosk mode (full-screen) after you configure a URL to browse. Use these keyboard shortcuts to exit or hide the app.

When running the application you can use a few keyboard shortcuts to control the program. This can be useful when debugging a kiosk application in an exhibit.

| Action                       | Windows | macOS |
| ---                          | ---     | ---   |
| Settings page                | <kbd>Ctrl</kbd> + <kbd>,</kbd> | <kbd>Cmd</kbd> + <kbd>,</kbd> |
| Reload page                  | <kbd>Ctrl</kbd> + <kbd>R</kbd> | <kbd>Cmd</kbd> + <kbd>R</kbd> |
| Open dev tools               | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>Opt</kbd> + <kbd>I</kbd> |
| Hide application<sup>*</sup> | <kbd>Ctrl</kbd> + <kbd>H</kbd> | <kbd>Ctrl</kbd> + <kbd>H</kbd> |
| Quit application             | <kbd>Ctrl</kbd> + <kbd>Q</kbd> | <kbd>Cmd</kbd> + <kbd>Q</kbd> |

\* Hide application works on Windows. On Mac, we simply open the file explorer, pushing the Stele application into the background.

# Security warning
This app is built on the Electron runtime and is under active development. It doesn't yet follow all of Electron's best-practices around system security. Stele is primarily designed for local content that you trust. Don't configure it to browse to web content you don't trust. Web content theoretically could have access to execute system commands on your local machine. [Better checks, will be added in future releases.](https://github.com/scimusmn/stele/issues/20)

# Development
Follow the [development instructions](docs/development.md) to make changes to the Stele source code.

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
