import React from 'react';
import { Button } from 'antd';
import request, { extend } from '../../../../dist/index';
// import request, { extend } from 'umi-request'
// const request1 = require('../../../../dist/index').default;
const myRequest = extend({
  prefix: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  return (
    {
      url,
      options: { ...options, params: { ...options.params, ctoken: 'asd12asd' } },
    }
  );
});
function Home() {
  const fetchList = () => {
    request('/', {
      method: 'GET',
    }).then(item => {
      console.log(item)
    })

    myRequest('/index', {
      method: 'GET',
      params: { id: 1 }
    }).then(item => {
      console.log(item)

    })
  }
  return (
    <div>
      <Button onClick={fetchList}>点击请求</Button>
    </div>
  )
}
export default Home