import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import Settings from '../Settings';
import DelayStart from '../DelayStart';
import NoMatch from '../NoMatch';
import Loading from '../Loading';

class AppRoutes extends React.Component {

  componentDidMount() {
    // Tell the main process that the render process is ready for navigation commands
    ipcRenderer.send('routerMounted');

    // Navigate to a route based on IPC commands from the main process
    ipcRenderer.on('navigate', (_, path, param) => {
      const { history } = this.props;
      const navigationPath = param ? `${path}/${param}` : path;
      history.push(navigationPath);
    });
  }

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
  history: PropTypes.object
};

AppRoutes.defaultProps = {
  history: {}
};

export default withRouter(AppRoutes);
