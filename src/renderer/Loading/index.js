/**
 * Loading spinner
 *
 * We delay the display of the spinner for a 1/4 sec. so that it doesn't
 * constantly flash between every page transition.
 */
import React from 'react';
import Delay from 'react-delay';
import spinner from './spinner.svg';

function Loading() {
  const style = {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
  };

  return (
    <Delay
      wait={250}
    >
      <div style={style}>
        <img src={spinner} alt="loading" />
      </div>
    </Delay>
  );
}

export default Loading;
