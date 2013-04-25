"""A setup file for the Stele kiosk system"""

from fabric.api import local
import shutil


def install():
    """Install the Stele kiosk browser system"""
    shutil.copy('cfg/browser.cfg.default', 'cfg/browser.cfg')
