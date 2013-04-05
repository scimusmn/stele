#!/usr/bin/env python

""" Browser control system """

import time
from init import get_machines_config, check_true
from selenium import webdriver

# We'll use this later
#from selenium.webdriver.common.keys import Keys

CFG = get_machines_config()


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


def main():
    chrome_launch()


if __name__ == '__main__':
    main()
