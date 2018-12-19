import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Timer from '../Timer';
import './DelayStart.global.css';

function DelayStart({ match }) {
  return (
    <Fragment>

      <div className="vert-container text-center">
        <h1>Stele</h1>
        <h2>Launch is delayed</h2>
        <h4>
          The application will load in:
        </h4>
        <pre className="mt-3">
          <Timer direction="down" end={0} start={match.params.delay * 1000} />
          <br />
          seconds
        </pre>
        <Button
          onClick={() => {
            // TODO: Make an IPC call to load the URL
            console.log('IPC to skip delay');
          }} color="warning"
        >Skip delay</Button>
      </div>
    </Fragment>
  );
}

DelayStart.propTypes = {
  match: PropTypes.object.isRequired,
};

export default DelayStart;

