# Stele

<img align="right" alt="Image of a Maya stele at Copan, by Frederick Catherwood" src="/resources/copan.png" />

Stele is an exhibit kiosk browser, built for the museum environment.

This app is meant to serve as a full-screen wrapper that simply views an existing web application.

# Usage

Download the [latest release for Windows or macOS](https://github.com/scimusmn/stele/releases/latest).

## OS Specific Instructions

### Windows 10
Use the latest `stele-win-#.#.#-installer.exe` file to install the app on Windows 10.

This will install Stele in the active user's AppData folder: `C:\Users\username\AppData\Local\Programs\stele\Stele.exe`

This folder is often hidden from non-admin users. 

The installer will also add a Stele menu item in the Windows Start menu.

#### Start on boot
If you configure Stele to start on boot via the Stele Settings page, the Windows app will create a registry entry at:
`\HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`

### macOS
Use the latest `.dmg` file to install the app on macOS.

This will prompt you to copy the Stele.app into the root `/Applications` folder.

#### Start on boot
If you configure Stele to start on boot via the Stele Settings page, the Mac app will create an entry for Stele in your user's Login Items. 
`System Preferences > Users & Groups > Login Items`

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
This app is under active development, but doesn't yet follow all of Electron's best-practices around system security. Stele is primarily designed for local content that you trust. Don't configure it to browse to web content you don't trust. Web content theoretically could have access to execute system commands on your local machine. [Better checks, will be added in future releases.](https://github.com/scimusmn/stele/issues/20)

# Development
## Setup

Clone the repo and run `yarn`
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    yarn dev

### Build production app
If you've made changes to the application and are ready to release a new version, first change the version number in the `/app/package.json` file. Then build the application with:

    yarn package

This will save either a `.dmg` (macOS), `.exe` (Windows 10).

## Change kiosk URL
When you start the app, and no URL is set, you will be directed to the settings page to enter a URL for your kiosk view.

When operating the app in kiosk mode use the `Cmd`+`,` keyboard shortcut to access the settings page.


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
