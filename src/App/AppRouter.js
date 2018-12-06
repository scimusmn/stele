import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Settings from '../Settings';
import DelayStart from '../DelayStart';
import NoMatch from '../NoMatch';

class AppRoutes extends React.Component {
  componentWillMount() {
    console.log('mounting');
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

export default withRouter(AppRoutes);
