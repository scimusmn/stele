#!/usr/bin/env python

""" Browser control system for kiosks """

import time
import re
from init import get_machines_config, check_true
from selenium import webdriver

CFG = get_machines_config()

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
    print "Watching the browser"
    while 1:
        check_domain()
        time.sleep(period)


def check_domain():
    """Check that you are on the specified domain

    If the user navigates away return to the homepage in the CFG.
    """
    current_url = driver.current_url
    restricted_domain_regex = str(CFG['browser']['restricted_domain_regex'])
    match = re.search(restricted_domain_regex, current_url)
    if match:
        pass
    else:
        # TODO write to a log here, so we can assess errant navigation
        driver.get(CFG['browser']['home_url'])


def chrome_close():
    """Exits the browser """
    driver.close()


def main():
    """Launch the browser wait a bit then close

    During development I'm just checking to see how the system opens and
    operates. So I'm just launching an closing browser instances. This
    obviously isn't how this will work in the long run.
    """
    print 'Launching Chrome'
    chrome_launch()

    if check_true(CFG['browser']['custom_check']) is True:
        period = float(CFG['browser']['custom_check_period'])
        check_browser(period)

    #if check_true(CFG['browser']['restrict_domain']) is True:
        #watch_browser(5)

    #time.sleep(2)
    #chrome_close()


if __name__ == '__main__':
    main()
