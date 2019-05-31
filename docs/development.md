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
