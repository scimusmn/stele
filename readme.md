# Stele
<img align="right" alt="Image of a Maya stele at Copan" src="/media/copan.png" />
A control system for kiosked web browsers, built on top of Selenium, WebDriver, and Chrome.

# Work in Progress
This is a sketch and is not ready for production.

# Installation
### 1. Install Python
### 2. Install the Selenium Python wrapper

```bash
$ sudo pip install selenium
```

### 3. Install ChromeDriver
Download and install the [appropriate version of ChromeDriver for your OS](http://code.google.com/p/chromedriver/downloads/list)

### 4. Download stele
```bash
$ git clone git@github.com:scimusmn/stele.git
```

### 5. Configure
If you need to change any of the configurations you can edit the browser.cfg file, but some elements are still hard coded into the browser.py file. So this config isn't that changeable yet.

### 6. Run chrome_kiosk
```bash
$ chmod +x browser.py
$ ./browser.py
```
# What's a Stele?
(http://en.wikipedia.org/wiki/Stele)
