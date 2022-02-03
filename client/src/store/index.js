import React from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';

import StoreDashboard from './pages/StoreDashboard';

const Dashboards = ({ match }) => {
  const history = useHistory();

  return (
    <Switch>
      <Route path={`${match.url}/`} render={(props) => <StoreDashboard {...props} />} />
      <Redirect to="/ui/error" />
    </Switch>
  );
};

export default Dashboards;
