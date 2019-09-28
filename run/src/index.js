import React from 'react'
import ReactDom from'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './App';
import antd from "antd/dist/antd.css";

ReactDom.render((
  <HashRouter>
    <App />
  </HashRouter>
), document.getElementById('root'));

