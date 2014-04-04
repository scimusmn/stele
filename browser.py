#!/usr/bin/env python

""" Browser control system for kiosks """

import logging
from logging.handlers import TimedRotatingFileHandler
import time
import re
from init import get_machines_config, check_true
from selenium import webdriver

#
# Logging
#

# Logger settings
LOG_FILENAME = 'log/stele.log'
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

# Rotate logs daily. Keep 30 days.
handler = TimedRotatingFileHandler(
    LOG_FILENAME,
    when="d",
    interval=1,
    backupCount=30)

formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
handler.setFormatter(formatter)
log.addHandler(handler)

#
# Custom imports based on configuration
#
CFG = get_machines_config()
if check_true(CFG['browser']['delay']) is True:
    time.sleep(180)
if check_true(CFG['browser']['custom_check']) is True:
    from custom import custom_check


def chrome_launch():
    """Launch the Chrome browser using Selenium and ChromeDriver

    This function launches Chrome with the CFG options and makes the
    browser object (driver) global so that this same browser instance
    can be controlled by other functions based on other UDP messages

    Returns:
        The selenium webdriver object, which can be referenced
        for browser control
    """
    global driver

    # Chrome startup options
    options = webdriver.ChromeOptions()
    user_agent = '--user-agent="' + CFG['browser']['user_agent'] + '"'
    options.add_argument(user_agent)

    if check_true(CFG['browser']['kiosk']) is True:
        options.add_argument('--kiosk')

    if check_true(CFG['browser']['touch']) is True:
        options.add_argument('--touch-events')

    options.add_argument('--allow-file-access-from-files')
    options.add_argument('--enable-logging --v=1')
    options.add_argument('--disable-accelerated-video-decode')

    # Launch Chrome in default location or with some alternate options
    # for common Windows paths
    try:
        driver = webdriver.Chrome(chrome_options=options)
    except webdriver.chrome.webdriver.WebDriverException:
        chrome_paths = ('c:\Program Files\chromedriver.exe',
                        'c:\Program Files (x86)\chromedriver.exe')
        for chrome_path in chrome_paths:
            try:
                driver = webdriver.Chrome(chrome_path, chrome_options=options)
            except webdriver.chrome.webdriver.WebDriverException:
                pass
            else:
                break

    # Visit the homepage
    driver.get(CFG['browser']['home_url'])

    return driver


def watch_browser(driver, period):
    """Poll the browser every 'period' and execute checks

    This function operates in an infinite loop.
    TODO: add some KeyboardInterrupt exception handling.

    Args:
        driver: The selenium webdriver object
        period: A string indicating how long to wait every loop
    """
    log.debug('Watching the browser')
    while 1:
        check_domain(driver)
        check_windows(driver)
        time.sleep(period)


def check_domain(driver):
    """Check that you are on the specified domain

    If the user navigates away return to the homepage in the CFG.

    Args:
        driver: The selenium webdriver object
    """
    # TODO - Add exception handling here for the NoSuchWindowException

    # Try to get the current window's URL.
    # We handle exceptions here, because web driver seems to loose the ability
    # to handle the current window sporadically, especially after the system
    # has closed previous windows.
    try:
        current_url = driver.current_url
    except (SystemExit, KeyboardInterrupt):
        raise
    except Exception, e:
        print e
        log.warn('Couldn\'t get current URL', exc_info=True)
        current_url = ''

    # Check current url against whitelist pattern
    restricted_domain_regex = str(CFG['browser']['restricted_domain_regex'])
    match = re.search(restricted_domain_regex, current_url)
    if match:
        pass
    else:
        # TODO write to a log here, so we can assess errant navigation
        log.warn('URL out of bounds: %s' % current_url)
        log.debug('RegEx boundary pattern: %s' % restricted_domain_regex)
        log.debug('Current windows: %s' % driver.window_handles)
        driver.get(CFG['browser']['home_url'])


def check_windows(driver):
    """Check that you only have one window or tab open

    For now we only ever want one window open.
    This will check the window handles and close all but the first one.
    TODO: Allow a customizable number of windows/tabs.

    Args:
        driver: The selenium webdriver object
    """
    while len(driver.window_handles) != 1:
        windows = driver.window_handles
        first_window = windows[0]
        last_window = windows[-1]
        log.warn('Closing extra windows: %d windows open' % len(windows))
        driver.switch_to_window(last_window)
        driver.close()
        driver.switch_to_window(first_window)


def chrome_close(driver):
    """Exits the browser """
    driver.close()


def main():
    """Launch the browser and run checks """

    log.info('Launching the browser')
    driver = chrome_launch()

    if check_true(CFG['browser']['restrict_domain']) is True:
        watch_browser(driver, 0)

    #
    # TODO
    # Create a clean quit key command
    #
    #chrome_close(driver)


if __name__ == '__main__':
    main()
