# Configuration documentation

## Location
The config file should be located at cfg/browser.cfg

## Settings
The config file consists of key value pairs like this:
```
key: value
```
Documention below explains each pair with an example configuration. Some settings activate others.

### home_url
The homepage to load when the browser boots.

    home_url: http://www.smm.org

### kiosk
Boolean. If True, Stele will launch Chrome with the --kiosk flag. This will make Chrome full screen and also prevent some things like the Windows bar OS X dock from displaying, depending on you OS.

    kiosk: True

### user_agent
Replace the user agent with a custom string, using the Chrome --user-agent flag. This can be useful when custom web applications modify the theme of a site for specific custom kiosk viewers.

    user_agent: museum_kiosk computer_01
