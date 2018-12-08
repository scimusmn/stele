import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import Settings from '../Settings';
import DelayStart from '../DelayStart';
import NoMatch from '../NoMatch';

class AppRoutes extends React.Component {
  componentDidMount() {
    // Tell the main process that the render process is ready for navigation commands
    ipcRenderer.send('routerMounted');

    ipcRenderer.on('navigate', (_, arg) => {
      const { history } = this.props;
      history.push(arg)
    });
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact component={Settings} />
        <Route exact path="/delay-start" component={DelayStart} />
        <Route component={NoMatch} />
      </Switch>
    );
  }
}

AppRoutes.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(AppRoutes);
