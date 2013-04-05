#!/usr/bin/env python

""" Setup the SOS system for communication on the network """

import ConfigParser
import collections
import os
import sys

SCRIPT_PATH, __ = os.path.split(sys.argv[0])


def check_true(string):
    """ Check if a true seems like a potentially true value

    Return a boolean
    """
    print "String = " + string
    string = string.lower()
    print "string = " + string
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
    cfg = collections.namedtuple('Config', ['ip', 'port'])

    browser = {'home_url': config.get("browser", "home_url"),
               'kiosk': config.get("browser", "kiosk"),
               'user_agent': config.get("browser", "user_agent")}

    cfg = {'browser': browser}

    return cfg
