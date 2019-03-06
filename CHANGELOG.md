# Change Log

## [2.1.0](https://github.com/scimusmn/stele/tree/2.1.0) (2019-03-06)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.2...2.1.0)

**Implemented enhancements:**

- Allow configurers to `forget` a display [\#71](https://github.com/scimusmn/stele/issues/71)
- As a user I want to be able to be able to display the dev tools console when the app is in production so that I can debug the renderer process [\#63](https://github.com/scimusmn/stele/issues/63)
- Implement window control [\#6](https://github.com/scimusmn/stele/issues/6)

**Fixed bugs:**

- If you move settings window off the primary display the configured URL won't display on the correct display in kiosk mode [\#75](https://github.com/scimusmn/stele/issues/75)
- Global keyboard shortcuts are blocking copy & paste in other apps [\#74](https://github.com/scimusmn/stele/issues/74)
- Can't save URLs from the Settings page after multi-display code added [\#70](https://github.com/scimusmn/stele/issues/70)

**Closed issues:**

- Don't require a display to be shown on the primary display [\#72](https://github.com/scimusmn/stele/issues/72)
- As a person configuring the app, I would like to be able to see when a display is configured in the settings, but the display is no longer connected, so that I can understand why some content isn't displaying. [\#69](https://github.com/scimusmn/stele/issues/69)
- As a user I would like to disable displays so that I don't have to configure content for a connected monitor [\#68](https://github.com/scimusmn/stele/issues/68)
- Fix menu code duplication [\#67](https://github.com/scimusmn/stele/issues/67)
- Handle initial settings setup for window control [\#53](https://github.com/scimusmn/stele/issues/53)
- Hide cursor feature should only be active on remote pages, not delay or setting pages [\#52](https://github.com/scimusmn/stele/issues/52)

## [v2.0.2](https://github.com/scimusmn/stele/tree/v2.0.2) (2019-02-19)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.2-alpha.1...v2.0.2)

**Implemented enhancements:**

- Refactor the app to organize the renderer \(React app\) in its own folder separate from the main \(Electron\) process [\#64](https://github.com/scimusmn/stele/issues/64)

**Closed issues:**

- Move common config in webpack to base.js file [\#66](https://github.com/scimusmn/stele/issues/66)
- Clean up CSS handling in Webpack [\#65](https://github.com/scimusmn/stele/issues/65)
- Ensure app has keyboard focus [\#58](https://github.com/scimusmn/stele/issues/58)
- As a user I want a setting that will allow me to make Stele automatically start on boot so that I don't need to configure startup options manually [\#56](https://github.com/scimusmn/stele/issues/56)
- Add a security warning [\#54](https://github.com/scimusmn/stele/issues/54)

**Merged pull requests:**

- Feat keyboard focus [\#60](https://github.com/scimusmn/stele/pull/60) ([azuldev1](https://github.com/azuldev1))
- Feat auto start [\#59](https://github.com/scimusmn/stele/pull/59) ([azuldev1](https://github.com/azuldev1))

## [v2.0.2-alpha.1](https://github.com/scimusmn/stele/tree/v2.0.2-alpha.1) (2019-01-04)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.1...v2.0.2-alpha.1)

## [v2.0.1](https://github.com/scimusmn/stele/tree/v2.0.1) (2018-12-28)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.1-alpha.3...v2.0.1)

**Implemented enhancements:**

- Fix eslint settings [\#43](https://github.com/scimusmn/stele/issues/43)
- Implement URL regex for URL input validation [\#22](https://github.com/scimusmn/stele/issues/22)

**Fixed bugs:**

- App crashes when you configure it with an invalid URL [\#49](https://github.com/scimusmn/stele/issues/49)
- Fix eslint settings [\#43](https://github.com/scimusmn/stele/issues/43)
- Cannot use Command+V to paste text in Production build. [\#42](https://github.com/scimusmn/stele/issues/42)

## [v2.0.1-alpha.3](https://github.com/scimusmn/stele/tree/v2.0.1-alpha.3) (2018-12-28)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.1-alpha.2...v2.0.1-alpha.3)

**Implemented enhancements:**

- As a developer I want a way to build just the .exe or .app of the production app, so that I can test production issues quicker [\#48](https://github.com/scimusmn/stele/issues/48)
- Reimplement delay page timer [\#35](https://github.com/scimusmn/stele/issues/35)

**Fixed bugs:**

- Menu shows on Windows production build [\#46](https://github.com/scimusmn/stele/issues/46)
- Production build: Command+COMMA does not trigger Settings screen.  [\#44](https://github.com/scimusmn/stele/issues/44)

**Closed issues:**

- Release 2.0.0 [\#13](https://github.com/scimusmn/stele/issues/13)
- Create `switch to desktop` keyboard shortcuts for Linux and Windows [\#11](https://github.com/scimusmn/stele/issues/11)

## [v2.0.1-alpha.2](https://github.com/scimusmn/stele/tree/v2.0.1-alpha.2) (2018-12-27)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.1-alpha.1...v2.0.1-alpha.2)

**Closed issues:**

- Update README to reflect new settings behavior [\#31](https://github.com/scimusmn/stele/issues/31)

## [v2.0.1-alpha.1](https://github.com/scimusmn/stele/tree/v2.0.1-alpha.1) (2018-12-19)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.0...v2.0.1-alpha.1)

**Implemented enhancements:**

- Add setting to hide mouse cursor [\#37](https://github.com/scimusmn/stele/issues/37)

**Fixed bugs:**

- Keyboard shortcuts should only trigger when the app has focus [\#40](https://github.com/scimusmn/stele/issues/40)
- The delay timer keeps running even when settings actions have been called [\#38](https://github.com/scimusmn/stele/issues/38)

**Closed issues:**

- Publish built assets for version 2.0.0 [\#36](https://github.com/scimusmn/stele/issues/36)
- Update project wiki with stele documentation [\#14](https://github.com/scimusmn/stele/issues/14)

**Merged pull requests:**

- Cursor Visibility in Settings [\#39](https://github.com/scimusmn/stele/pull/39) ([tnordberg](https://github.com/tnordberg))

## [v2.0.0](https://github.com/scimusmn/stele/tree/v2.0.0) (2018-12-14)
[Full Changelog](https://github.com/scimusmn/stele/compare/v2.0.0-alpha.1...v2.0.0)

**Implemented enhancements:**

- Add an option to save a log of the console.log from the render process [\#32](https://github.com/scimusmn/stele/issues/32)
- Figure out a better way to handle window focus [\#27](https://github.com/scimusmn/stele/issues/27)
- Modify webpack to prevent browser focus on hot-module-reload [\#23](https://github.com/scimusmn/stele/issues/23)
- Handle URL lookup errors [\#16](https://github.com/scimusmn/stele/issues/16)
- Implement a settings page for URL definition [\#3](https://github.com/scimusmn/stele/issues/3)

**Fixed bugs:**

- Application isn't loading settings on Windows [\#26](https://github.com/scimusmn/stele/issues/26)
- Pass environment through to the electron.js file / Fix kiosk mode [\#21](https://github.com/scimusmn/stele/issues/21)
- Handle URL lookup errors [\#16](https://github.com/scimusmn/stele/issues/16)
- Edit menu item visible in Windows application [\#15](https://github.com/scimusmn/stele/issues/15)

**Closed issues:**

- Enable log rotation on file logging [\#33](https://github.com/scimusmn/stele/issues/33)
- Configure a keyboard shortcut to navigate to settings [\#30](https://github.com/scimusmn/stele/issues/30)
- After submitting the settings page, you should be taken to the setup URL [\#29](https://github.com/scimusmn/stele/issues/29)
- Style the settings form [\#28](https://github.com/scimusmn/stele/issues/28)
- Fix electron configuration errors [\#25](https://github.com/scimusmn/stele/issues/25)
- Implement Hot Module Reload for the React pages [\#18](https://github.com/scimusmn/stele/issues/18)
- Add a "What's a Stele" explanation to the README [\#9](https://github.com/scimusmn/stele/issues/9)
- Release a version of the Electron system [\#8](https://github.com/scimusmn/stele/issues/8)
- Update app code to match our in-house style [\#5](https://github.com/scimusmn/stele/issues/5)
- Update app icons [\#4](https://github.com/scimusmn/stele/issues/4)

## [v2.0.0-alpha.1](https://github.com/scimusmn/stele/tree/v2.0.0-alpha.1) (2018-09-15)
[Full Changelog](https://github.com/scimusmn/stele/compare/v1.0.0...v2.0.0-alpha.1)

## [v1.0.0](https://github.com/scimusmn/stele/tree/v1.0.0) (2015-08-05)
[Full Changelog](https://github.com/scimusmn/stele/compare/v0.0.1...v1.0.0)

## [v0.0.1](https://github.com/scimusmn/stele/tree/v0.0.1) (2013-04-05)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*