muse-electron-boilerplate
==============
Boilerplate application for [Electron runtime](http://electron.atom.io), focused on museum kiosk use.

# Credit
This is a fork of [szwacz's great electron-boilerplate](https://github.com/szwacz/electron-boilerplate). Our internal needs are just unique/different enough, that it make sense to set up our own version.

# Using this boilerplate

```
git clone https://github.com/scimusmn/muse-electron-boilerplate.git
cd muse-electron-boilerplate
rm -rf .git
git init
git create yourorganization/your-new-repo-name
```

## Change your project details
Change the name, description, and version numbers for the application you will be developing. There are several place to do this:

* `/app/package.json` - Name, description, version, etc.
* `/app/app.html` - Title tag

## Running and building your apps
To start the application in development mode, run:

    $ npm start

To build a release of the application for installation on the exhibit kiosk, run:

    $ npm run release
