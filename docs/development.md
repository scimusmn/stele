# Development

## Requirements and setup
Ensure you have Git, Node **20 or higher**, NPM, and Yarn installed on your development machine.

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

In the `Choose a tag` dropdown, enter the same version number from the package.json, but prepend it with a `v`. E.g., if your version number is `4.5.23` in package.json, then the release version number should be `v4.5.23`.

Enter a descriptive title for the release following this template:
`stele v4.5.23 - Very short high level description of the release`

### Create release notes
Click the `Generate release notes`
Clean up the auto-generated release notes to be human-readable if necessary.

### Upload binaries
Attach the newly generated Stele binaries in the Attachment section

## Publish release to Github
Click `Publish release`

