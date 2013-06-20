# Configuration documentation

## Location
The config file should be located at cfg/browser.cfg

## Settings
The config file consists of key value pairs like this:

    key: value

Documention below explains each pair with an example configuration. Some settings activate others.

### delay
Boolean. If True, Stele will pause for 3 minutes before launching Chrome. This is useful when we run a local webserver which needs to start up before loading the kiosk start page.

    delay: True

### home_url
The homepage to load when the browser boots.

    home_url: http://www.smm.org

### kiosk
Boolean. If True, Stele will launch Chrome with the `--kiosk` flag. This will make Chrome full screen and also prevent some things like the Windows bar OS X dock from displaying, depending on you OS.

    kiosk: True

### touch 
Boolean. If True, Stele will launch Chrome with the `--touch-events` flag. This enables support for touch events.

    touch: True
    
### user_agent
Replace the user agent with a custom string, using the Chrome `--user-agent` flag. This is useful for identifying specific kiosks to custom web applications.

    user_agent: museum_kiosk computer_01

### restrict_domain
Prevent the user from navigating away from a specific URL or general domain. This only works if the restricted_domain_regex is set as well.

    restrict_domain: True

### restricted_domain_regex
This is only evaluated if restrict_domain is set to True.

Define a walled garden within which the user is allowed to browse. Ever X seconds the current URL is compared against this regular expression. If it fails the user will be directed back to the homepage.

    restricted_domain_regex: .*google.com.*
