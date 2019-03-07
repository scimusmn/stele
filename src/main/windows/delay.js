import os from 'os';
import _ from 'lodash';

//
// Lookup the delay time environment variable
//
// Return NaN if set and not transformable to a number.
// Returns 0 if the environment variable is not set
// Returns an optional defaultSeconds if the environment variable is not set
//
const getDelayTime = defaultSeconds => (process.env.STELE_DELAY
  ? process.env.STELE_DELAY * 1
  : defaultSeconds || 0);

// Check whether the computer has been up long enough to start the configured URL
// If we just started up returns false
const checkUptime = (nominalUptime) => {
  // Seconds since launch, when it will be safe to load the URL
  const nominalUptimeValue = nominalUptime || 300;
  return !(os.uptime() < nominalUptimeValue);
};

const delay = () => {
  // In dev we only set a delay if the delay value is explicitly set as an environment variable and
  // the delay value is a real number greater than 0.
  const delayTime = process.env.NODE_ENV === 'development' ? getDelayTime() : getDelayTime(30);
  if (process.env.NODE_ENV === 'development') {
    if (_.isFinite(delayTime) && delayTime > 0) {
      return delayTime;
    }
    return 0;
  }
  // In production, we do a simple check as to whether to display the delay or not.
  if (!checkUptime()) {
    return delayTime;
  }
  return 0;
};

export default delay;
