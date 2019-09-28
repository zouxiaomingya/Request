import React, {Fragment} from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Home from './page/home';

export default () => (
  <Fragment>
    <Switch>
      <Route path='/home' component={Home} />
      <Redirect from='/' to='/home' />>
    </Switch>
  </Fragment>
)
