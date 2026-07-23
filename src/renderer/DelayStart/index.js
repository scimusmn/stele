import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import Timer from '../Timer';
import logo from '../assets/smm_logo.png';
import './DelayStart.css';

function DelayStart({ match }) {
  return (
    <Fragment>
      <div className="kiosk-page delay-start">
        <div className="delay-start__panel">
          <img
            className="kiosk-logo"
            src={logo}
            alt="Science Museum of Minnesota"
          />
          <h1 className="delay-start__title">Stele</h1>
          <h2 className="delay-start__subtitle">Launch is delayed</h2>
          <p className="delay-start__label">The application will load in</p>
          <div className="delay-start__timer">
            <Timer direction="down" end={0} start={match.params.delay * 1000} />
            <span className="delay-start__timer-unit">seconds</span>
          </div>
          <Button
            size="lg"
            className="btn-accent"
            onClick={() => {
              // TODO: Make an IPC call to load the URL
              ipcRenderer.send('skipDelay');
              console.log('IPC to skip delay');
            }}
          >
            Skip delay
          </Button>
        </div>
      </div>
    </Fragment>
  );
}

DelayStart.propTypes = {
  match: PropTypes.object.isRequired,
};

export default DelayStart;
