import init
import time

"""Zabbix notification tools

Zabbix is a network and application monitorng tool. We use it to oversee the
operations on multiple kiosks. These functions allow us to send Zabbix
status updates about the kiosk operations for central monitoring.
"""


def send_zabbix_message(command_type):
    """Send Zabbix a message

    Args:
        type: What type of show action occurred

    Returns:
        A boolean indicating if the commands were sent with (1) or
        without (0) any errors.
    """

    # Push a notification to Zabbix if the PEDT show is started
    timestamp = str(time.time())
    # TODO check for the presence of this script

    # -s: The name of this 'host' in the Zabbix system
    # -k: The key or message to send to Zabbix
    # TODO: Get the -s value from a config file
    command = 'zabbix_sender -c /etc/zabbix/zabbix_agentd.conf\
            -s example -k %s -o %d' % (command_type, timestamp)

    print
    output, error = init.execute_shell_command(command)
    if error != '':
        print "There was a problem: %s" % error
        return 1

    return 0
