#!/usr/bin/env python

""" Setup the SOS system for communication on the network """

import ConfigParser
import collections
import os
import subprocess
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

    browser = {'home_url': config.get("browser", "home_url"),
               'kiosk': config.get("browser", "kiosk"),
               'user_agent': config.get("browser", "user_agent"),
               'restrict_domain': config.get("browser", "restrict_domain"),
               'restricted_domain_regex':
               config.get("browser", "restricted_domain_regex"),
               'zabbix': config.get("browser", "zabbix"),
               'zabbix_agentd_cfg': config.get("browser", "zabbix_agentd_cfg"),
               'zabbix_hostname': config.get("browser", "zabbix_hostname")}

    cfg = {'browser': browser}

    return cfg


def execute_shell_command(command):
    """Parse shell commands and use subprocess to execute them

    Args:
        commands: a string of a command to be wrapped in the
        Python subprocess calls
    Returns:
        Returns a tuple of the stdout and stderr
    """
    process = subprocess.Popen(command.split(' '),
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               shell=True)
    return process.communicate()
