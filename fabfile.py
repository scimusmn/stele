"""A setup file for the Stele kiosk system"""

from fabric.api import local
import os
import shutil


def install():
    """Install the Stele kiosk browser system"""
    cfg_src = 'cfg/browser.cfg.default'
    cfg_dst = 'cfg/browser.cfg'
    if not os.path.exists(cfg_src, cfg_dst):
        try:
            shutil.copy(cfg_src, cfg_dst)
            print 'The config file is ready for modification.'
        except:
            print 'There was a problem and the config file wasn\'t setup.'
    else:
        print 'There is already a config file in place. Please edit it.'
