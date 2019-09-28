import React from 'react';
import Router from './router'
import { Link  } from 'react-router-dom'

function App() {
  return (
    <div>
      <Link to='/home'>home</Link>
      <Router />
  </div>
  )
}

export default App