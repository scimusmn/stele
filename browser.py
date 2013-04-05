#!/usr/bin/env python

""" Browser control system """

from init import get_machines_config
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

CFG = get_machines_config()


