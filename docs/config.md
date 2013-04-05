# Configuration documentation

## Location
The config file should be located at cfg/browser.cfg

## Settings
The config file consists of key value pairs like this:
```
key: value
```
Documention below explains each pair. Some settings activate others.

### home_url
The default homepage to load when the browser boots.

    home_url: http://www.example.com

### kiosk
Launch Chrome with the --kiosk flag. This will make Chrome full screen and also prevent some things like the Windows bar OS X dock from displaying, depending on you OS.

    kiosk: False
