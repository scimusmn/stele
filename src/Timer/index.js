import React from 'react';
import PropTypes from 'prop-types';

class Timer extends React.Component {
  constructor(props) {
    super(props);
    const {
      countDownSound, direction, start, end,
    } = this.props;
    this.state = {
      countDownSound,
      timer: direction === 'down' ? Math.abs(start - end) : start,
    };
    this.incrementTimer = this.incrementTimer.bind(this);
  }

  componentWillMount() {
    const { tick } = this.props;
    this.timer = setInterval(this.incrementTimer, tick);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  incrementTimer() {
    const { direction, stop } = this.props;
    // Pick the appropriate operator for check when the timer is done
    const op = direction === 'down' ? 'gt' : 'lt';
    const operators = {
      gt(a, b) {
        return a > b;
      },
      lt(a, b) {
        return a < b;
      },
    };

    // Increment the timer in the correct direction
    const { tick, end, completion } = this.props;
    const { timer } = this.state;
    const tickValue = direction === 'down' ? tick * -1 : tick;
    if (timer === end || stop) {
      clearInterval(this.timer);
      completion();
    } else {
      const newTimer = timer + tickValue;
      this.setState({
        timer: operators[op](newTimer, end)
          ? newTimer
          : end,
      });
    }
  }

  // Add two seconds to playing conditional to
  // handle clip delay
  render() {
    const { displayTimer } = this.props;
    const { timer, countDownSound } = this.state;
    return (
      <div>
        {timer}
      </div>
    );
  }
}

Timer.propTypes = {
  displayTimer: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['up', 'down']).isRequired,
  countDownSound: PropTypes.bool,
  end: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  completion: PropTypes.func,
  tick: PropTypes.number,
  stop: PropTypes.bool,
};

Timer.defaultProps = {
  completion: () => {
  },
  tick: 100,
  stop: false,
  countDownSound: false,
};

export default Timer;
