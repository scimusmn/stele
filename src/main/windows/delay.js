import os from 'os';

//
// Lookup the delay time environment variable
//
// Return NaN if set and not transformable to a number.
// Returns 0 if the environment variable is not set
// Returns an optional defaultSeconds if the environment variable is not set
//
function getDelayTime(defaultSeconds) {
  return process.env.STELE_DELAY ? process.env.STELE_DELAY * 1 : defaultSeconds || 0;
}

// Check whether the computer has been up long enough to start the configured URL
// If we just started up returns false
function checkUptime(nominalUptime) {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptimeValue = nominalUptime || 300;
  return !(os.uptime() < nominalUptimeValue);
}

export { getDelayTime, checkUptime };
