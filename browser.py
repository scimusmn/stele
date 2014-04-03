#!/usr/bin/env python

""" Browser control system for kiosks """

import logging
import logging.handlers
import time
import re
from init import get_machines_config, check_true
from selenium import webdriver

#
# Logging
#
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
LOG_FILENAME = 'log/stele.log'
# Set up a specific logger with our desired output level
my_logger = logging.getLogger('MyLogger')
my_logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
# Add the log message handler to the logger
handler = logging.handlers.RotatingFileHandler(
    LOG_FILENAME, maxBytes=2000, backupCount=10)
handler.setFormatter(formatter)
my_logger.addHandler(handler)

#
# Custom imports based on configuration
#
CFG = get_machines_config()
if check_true(CFG['browser']['delay']) is True:
    time.sleep(180)
if check_true(CFG['browser']['custom_check']) is True:
    from custom import custom_check


def header(txt):
    """Decorate a string to make it stand out as a header. """
    wrapper = "------------------------------------------------------"
    return wrapper + "\n" + txt + "\n" + wrapper


def chrome_launch():
    """Launch the Chrome browser using Selenium and ChromeDriver

    This function launches Chrome with the CFG options and makes the
    browser object (driver) global so that this same browser instance
    can be controlled by other functions based on other UDP messages
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


def check_browser(period):
    """Run custom checks on the browser """
    counter = 0
    print header('Running custom checks')
    print 'Parent custom checkes will be run every %d seconds' % period
    while 1:
        base_handle = driver.current_window_handle
        check_counter = custom_check(CFG, driver, counter, base_handle)
        counter = check_counter
        counter += 1
        print counter
        time.sleep(period)


def watch_browser(period):
    """Poll the browser every 'period' and execute checks

    TODO - Add a duration check
    """
    my_logger.debug('Watching the browser')
    while 1:
        check_domain()
        check_windows()
        time.sleep(period)


def check_domain():
    """Check that you are on the specified domain

    If the user navigates away return to the homepage in the CFG.
    """
    # TODO - Add exception handling here for the NoSuchWindowException
    current_url = driver.current_url
    restricted_domain_regex = str(CFG['browser']['restricted_domain_regex'])
    match = re.search(restricted_domain_regex, current_url)
    if match:
        pass
    else:
        # TODO write to a log here, so we can assess errant navigation
        my_logger.info('URL out of bounds: %s' % current_url)
        my_logger.debug('RegEx boundary pattern: %s' % restricted_domain_regex)
        driver.get(CFG['browser']['home_url'])


def check_windows():
    """Check that you only have one window or tab open

    For now we only ever want one window open.
    This will check the window handles and close all but the first one.
    TODO: Allow a customizable number of windows/tabs.
    """
    while len(driver.window_handles) != 1:
        windows = driver.window_handles
        first_window = windows[0]
        last_window = windows[-1]
        current_window = driver.current_window_handle
        my_logger.info('Closing extra windows: %d windows open' % len(windows))
        driver.switch_to_window(last_window)
        driver.close()
        driver.switch_to_window(first_window)


def chrome_close():
    """Exits the browser """
    driver.close()


def main():
    """Launch the browser wait a bit then close

    During development I'm just checking to see how the system opens and
    operates. So I'm just launching an closing browser instances. This
    obviously isn't how this will work in the long run.
    """
    my_logger.info('Launching Chrome')
    chrome_launch()

    if check_true(CFG['browser']['custom_check']) is True:
        period = float(CFG['browser']['custom_check_period'])
        check_browser(period)

    if check_true(CFG['browser']['restrict_domain']) is True:
        watch_browser(0)

    #chrome_close()


if __name__ == '__main__':
    main()
