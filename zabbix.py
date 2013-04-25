"""Zabbix notification tools

Zabbix is a network and application monitorng tool. We use it to oversee the
operations on multiple kiosks. These functions allow us to send Zabbix
status updates about the kiosk operations for central monitoring.
"""

import init
from init import get_machines_config

CFG = get_machines_config()


def send_message(key, value):
    """Send Zabbix a message

    Args:
        key: Zabbix key to be tracked
        value: The value to send to Zabbix

    Returns:
        A boolean indicating if the commands were sent with (1) or
        without (0) any errors.
    """
    command = 'zabbix_sender -c %s -s %s -k %s -o %d' % (
        CFG['browser']['zabbix_agentd_cfg'],
        CFG['browser']['zabbix_hostname'],
        key,
        value)

    print 'Command is = ' + command
    output, error = init.execute_shell_command(command)
    if error != '':
        print "There was a problem: %s" % error
        return 1

    return 0
