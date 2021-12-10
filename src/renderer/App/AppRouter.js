import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import Settings from '../Settings';
import DelayStart from '../DelayStart';
import NoMatch from '../NoMatch';
import Loading from '../Loading';

const AppRoutes = function ({ history }) {
  useEffect(() => {
    // Tell the main process that the render process is ready for navigation commands
    window.api.send('routerMounted');

    window.api.receive('navigate', (_, path, param) => {
      const navigationPath = param ? `${path}/${param}` : path;
      // Only do a push when the path will change
      if (history.location.pathname !== navigationPath) {
        history.push(navigationPath);
      }
    });
  }, []);

  render() {
    return (
      <Switch>
        <Route path="/" exact component={Loading} />
        <Route path="/settings" exact component={Settings} />
        <Route exact path="/delay-start/:delay" component={DelayStart} />
        <Route component={NoMatch} />
      </Switch>
    );
  }
}

AppRoutes.propTypes = {
  history: PropTypes.object,
};

AppRoutes.defaultProps = {
  history: {},
};

export default withRouter(AppRoutes);
