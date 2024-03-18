# Development

## Requirements and setup
Ensure you have Git, Node **18 or higher**, NPM, and Yarn installed on your development machine.

On macOS, you should be able to clone the git repo, install the dependencies and get going right away.

On Windows, you will need to install some global dev tools before you can get started.

### Windows setup
We use [node-gyp](https://github.com/nodejs/node-gyp) to help build various binaries used by Electron. To do this build step, you need to install some global system tools for Windows before you can run Stele in dev mode.

1. Open the Start menu and type `cmd`.
1. Right click on `Command Prompt` and select `Run as administrator`.
1. npm install --global --production windows-build-tools

## Install repo and packages
Clone the repo and run `yarn`

```bash
git clone git@github.com:scimusmn/stele.git
cd stele
yarn
```

# Run Stele in dev mode
In dev mode the application will not launch full-screen and the Chrome developer console/inspector will automatically display.

To launch in dev mode:

    yarn dev

# Build production app
If you've made changes to the application and are ready to release a new version, first commit all of your changes to the trunk branch (master).

## Test on each OS
You can build the application for each operating system or all of them with:

- Build for your current OS `yarn package`
- Build for macOS explicitly `yarn package-mac`
- Build for Windows explicitly `yarn package-win`
- Build for all OS'es `yarn package-all`

These commands will save all of the installers in the `release` folder.

Test that the application works on each of these OS'es before releasing a new version of the app.

# Publish a release
You've tested the app on each OS and you're ready to publish a new version of Stele on our Github page.

Follow these steps in this order to ensure all of the correct assets are created and uploaded to Github.

## Bump version number
In package.json, increase the version number by the appropriate level, following [semver](https://semver.org/).

Commit this change and push it to Github.

## Create draft release in Github
[Draft a new Github release](https://github.com/scimusmn/stele/releases/new).

In the version field, enter the same version number from the package.json, but prepend it with a `v`. E.g., if your version number is `4.5.23` in package.json, then the release version number should be `v4.5.23`.

Enter a descriptive title for the release following this template:
`stele v4.5.23 - Very short high level description of the release`

Don't worry about entering a description for the draft release at this stage.

Don't Publish, yet. Click **Save Draft**.

## Update CHANGELOG
Update the Changelog with your commits and issues since the last version release.
`export CHANGELOG_GITHUB_TOKEN="###"; github_changelog_generator --future-release 4.5.23`

Where ### is your own Github user token.

Commit these changes and push them to the trunk branch.

## Publish release to Github
In the description field enter more details about the release with a link to release's section in the [CHANGELOG.md](https://github.com/scimusmn/stele/blob/master/CHANGELOG.md).

