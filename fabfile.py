"""A setup file for the Stele kiosk system"""

from fabric.api import local
import shutil


def install():
    """Install the Stele kiosk browser system"""
    try:
        shutil.copy('cfg/browser.cfg.default', 'cfg/browser.cfg')
    except:
        print 'File was not copied.'
