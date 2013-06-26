#!/usr/bin/env python

""" Setup the SOS system for communication on the network """

import ConfigParser
import collections
import os
import sys

SCRIPT_PATH, __ = os.path.split(sys.argv[0])


def check_true(string):
    """ Check if an English string seems to contain truth.

    Return a boolean

    Default to returning a False value unless truth is found.
    """
    string = string.lower()
    if string in ['true', 'yes', '1', 'yep', 'yeah']:
        return True
    else:
        return False


def get_machines_config():
    """Load config file details into a named tuple """

    config = ConfigParser.ConfigParser()
    config_file = SCRIPT_PATH + "/cfg/browser.cfg"
    config.read(config_file)

    # TODO Cleanup these names
    cfg = collections.namedtuple('Config', ['key', 'value'])

    browser = {'delay': config.get("browser", "delay"),
               'home_url': config.get("browser", "home_url"),
               'kiosk': config.get("browser", "kiosk"),
               'touch': config.get("browser", "touch"),
               'custom_check': config.get("browser", "custom_check"),
               'custom_check_period': config.get("browser", "custom_check_period"),
               'user_agent': config.get("browser", "user_agent"),
               'restrict_domain': config.get("browser", "restrict_domain"),
               'restricted_domain_regex': config.get("browser", "restricted_domain_regex"),
              }

    cfg = {'browser': browser}

    return cfg
