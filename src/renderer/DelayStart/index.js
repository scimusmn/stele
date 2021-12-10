import React, { useEffect } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Timer from '../Timer';
import './DelayStart.css';

const DelayStart = function DelayStart({ match }) {
  useEffect(() => {

  }, []);
  return (
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
        size="lg"
        onClick={() => {
          window.api.send('skipDelay');
        }}
        color="warning"
      >
        Skip delay
      </Button>
    </div>
  );
};

DelayStart.propTypes = {
  match: PropTypes.object.isRequired,
};

export default DelayStart;
