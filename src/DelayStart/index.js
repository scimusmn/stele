import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Timer from '../Timer';

function DelayStart({ match }) {
  return (
    <Fragment>
      <h1>
        Launch delayed
        <Timer displayTimer direction="down" end={0} start={match.params.delay * 1000} />
      </h1>
      <p>The computer just booted up, so we are waiting a few minutes for background processes to
        fully start.
      </p>
      <p>The application will start soon.</p>
    </Fragment>
  );
}

DelayStart.propTypes = {
  match: PropTypes.object.isRequired,
};

export default DelayStart;

