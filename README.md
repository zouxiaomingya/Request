## 剖析 umi-request

> 最近业务繁忙，很久没有沉淀一些知识了，趁着今天下班的早，来学习学习 umi 的请求层 umi-request

[umi-request](https://github.com/umijs/umi-request)

> 代码拉下来之后, 直接进入主题

```javaScript
// src/index.js
import request, { extend, fetch } from './request';
import Onion from './onion';
import { RequestError, ResponseError } from './utils';

export { extend, RequestError, ResponseError, Onion, fetch };
export default request;

```
index 文件很清楚 分别引用了 3 个文件夹
1. request
2. onion
3. utils

### index.js 文件

```javaScript
const request = (initOptions = {}) => {
  const coreInstance = new Core(initOptions);
  const umiInstance = (url, options = {}) => {
    const mergeOptions = {
      ...initOptions,
      ...options,
      headers: {
        ...initOptions.headers,
        ...options.headers,
      },
      params: {
        ...initOptions.params,
        ...options.params,
      },
      method: (options.method || initOptions.method || 'get').toLowerCase(),
    };
    return coreInstance.request(url, mergeOptions);
  };
  // 省略一些代码 ....
  return umiInstance;
};
```

> request 构造函数中 关键的是 Core 这个方法。


### Core.js 文件

```javaScript
  request(url, options) {
    const { onion } = this;
    const obj = {
      req: { url, options },
      res: null,
      cache: this.mapCache,
      responseInterceptors,
    };
    if (typeof url !== 'string') {
      throw new Error('url MUST be a string');
    }

    return new Promise((resolve, reject) => {
      // dealRequestInterceptors 是请求拦截器
      Core.dealRequestInterceptors(obj)
        .then(() => onion.execute(obj))
        .then(() => {
          resolve(obj.res);
        })
        .catch(error => {
          const { errorHandler } = obj.req.options;
          if (errorHandler) {
            try {
              const data = errorHandler(error);
              resolve(data);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(error);
          }
        });
    });
  }
}
};
```

## 快速上手

执行 **GET** 请求

```javascript
import request from 'umi-request';

request.get('/api/v1/xxx?id=1')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// 也可将 URL 的参数放到 options.params 里
request.get('/api/v1/xxx', {
    params: {
      id: 1
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

执行 **POST** 请求

```
request.post('/api/v1/user', {
    data: {
      name: 'Mike'
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## umi-request API

可以通过向 **umi-request** 传参来发起请求

**umi-request(url[, options])**

```javascript
import request from 'umi-request';

request('/api/v1/xxx', {
    method: 'get',
    params: { id: 1 }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

request('/api/v1/user', {
    method: 'post',
    data: {
      name: 'Mike'
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

## 请求方法的别名

为了方便起见，为所有支持的请求方法提供了别名, `method` 属性不必在配置中指定

**request.get(url[, options])**

**request.post(url[, options])**

**request.delete(url[, options])**

**request.put(url[, options])**

**request.patch(url[, options])**

**request.head(url[, options])**

**request.options(url[, options])**

## 创建实例

有些通用的配置我们不想每个请求里都去添加，那么可以通过 `extend` 新建一个 umi-request 实例

**extend([options])**

```javascript
import { extend } from 'umi-request';

const request = extend({
  prefix: '/api/v1',
  timeout: 1000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

request.get('/user')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

NodeJS 环境创建实例

```javascript
const umi = require('umi-request');
const extendRequest = umi.extend({ timeout: 10000 })

extendRequest('/api/user')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
```

以下是可用的实例方法，指定的配置将与实例的配置合并。

**request.get(url[, options])**

**request.post(url[, options])**

**request.delete(url[, options])**

**request.put(url[, options])**

**request.patch(url[, options])**

**request.head(url[, options])**

**request.options(url[, options])**


### 讲解 request

```javaScript
const request = (initOptions = {}) => {
  const coreInstance = new Core(initOptions);
  const umiInstance = (url, options = {}) => {
    const mergeOptions = {
      ...initOptions,
      ...options,
      headers: {
        ...initOptions.headers,
        ...options.headers,
      },
      params: {
        ...initOptions.params,
        ...options.params,
      },
      method: (options.method || initOptions.method || 'get').toLowerCase(),
    };
    return coreInstance.request(url, mergeOptions);
  };

 // 省略中间件 拦截器代码
}
```

然后 通过 `export default request({});` 将其导出。因此可以看出
调用 request 其实就是调用 coreInstance.request(url, mergeOptions); 方法
因此重点也就在于 Core 方法之中。



```javaScript
class Core {
  constructor(initOptions) {
    this.onion = new Onion([]);
    this.fetchIndex = 0; // 【即将废弃】请求中间件位置
    this.mapCache = new MapCache(initOptions);
  }

  use(newMiddleware, opt = { global: false, core: false }) {
    this.onion.use(newMiddleware, opt);
    return this;
  }

  static requestUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    requestInterceptors.push(handler);
  }

  static responseUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Interceptor must be function!');
    responseInterceptors.push(handler);
  }

  // 执行请求前拦截器
  static dealRequestInterceptors(ctx) {
    const reducer = (p1, p2) =>
      p1.then((ret = {}) => {
        ctx.req.url = ret.url || ctx.req.url;
        ctx.req.options = ret.options || ctx.req.options;
        return p2(ctx.req.url, ctx.req.options);
      });
    return requestInterceptors.reduce(reducer, Promise.resolve()).then((ret = {}) => {
      ctx.req.url = ret.url || ctx.req.url;
      ctx.req.options = ret.options || ctx.req.options;
      return Promise.resolve();
    });
  }

  request(url, options) {
    const { onion } = this;
    const obj = {
      req: { url, options },
      res: null,
      cache: this.mapCache,
      responseInterceptors,
    };
    if (typeof url !== 'string') {
      throw new Error('url MUST be a string');
    }

    return new Promise((resolve, reject) => {
      Core.dealRequestInterceptors(obj)
        .then(() => onion.execute(obj))
        .then(() => {
          resolve(obj.res);
        })
        .catch(error => {
          const { errorHandler } = obj.req.options;
          if (errorHandler) {
            try {
              const data = errorHandler(error);
              resolve(data);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(error);
          }
        });
    });
  }
}

export default Core;
```

### Onion 方法

> 这个方法是比较核心的内容， 在onion 文件夹下包含index.js 和 compose.js 两个文件。

### index.js

其中就是存放中间件的地方，全局中间件，内核中间件，实例中间件

```javaScript
class Onion {
  constructor(defaultMiddlewares) {
    if (!Array.isArray(defaultMiddlewares)) throw new TypeError('Default middlewares must be an array!');

    this.middlewares = [...defaultMiddlewares];
  }

  static globalMiddlewares = []; // 全局中间件
  static defaultGlobalMiddlewaresLength = 0; // 内置全局中间件长度
  static coreMiddlewares = []; // 内核中间件
  static defaultCoreMiddlewaresLength = 0; // 内置内核中间件长度

  use(newMiddleware, opts = { global: false, core: false }) {
    let core = false;
    let global = false;
    if (typeof opts === 'number') {
      if (process && process.env && process.env.NODE_ENV === 'development') {
        console.warn(
          'use() options should be object, number property would be deprecated in future，please update use() options to "{ core: true }".'
        );
      }
      core = true;
      global = false;
    } else if (typeof opts === 'object' && opts) {
      global = opts.global || false;
      core = opts.core || false;
    }

    // 全局中间件
    if (global) {
      Onion.globalMiddlewares.splice(
        Onion.globalMiddlewares.length - Onion.defaultGlobalMiddlewaresLength,
        0,
        newMiddleware
      );
      return;
    }
    // 内核中间件
    if (core) {
      Onion.coreMiddlewares.splice(Onion.coreMiddlewares.length - Onion.defaultCoreMiddlewaresLength, 0, newMiddleware);
      return;
    }

    // 实例中间件
    this.middlewares.push(newMiddleware);
  }

  execute(params = null) {
    const fn = compose([...this.middlewares, ...Onion.globalMiddlewares, ...Onion.coreMiddlewares]);
    return fn(params);
  }
}

export default Onion;
```

之前在 core.js 文件中看到  `onion.execute(obj))`

调用了实例化的 Onion 中的 execute 方法。

```javaScript
execute(params = null) {
    const fn = compose([...this.middlewares, ...Onion.globalMiddlewares, ...Onion.coreMiddlewares]);
    return fn(params);
  }
```
该方法中的 execute 中使用了 compose 方法。这个方法中传入 middlewares, globalMiddlewares。 和 coreMiddlewares; compose方法执行后返回一个方法。
并且这个方法再次调用，也返回一个方法

### compose 

```javaScript
export default function compose(middlewares) {
  const middlewaresLen = middlewares.length;
  for (let i = 0; i < middlewaresLen; i++) {
    if (typeof middlewares[i] !== 'function') {
      throw new TypeError('Middleware must be componsed of function');
    }
  }
  return function wrapMiddlewares(params, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() should not be called multiple times in one middleware!'));
      }
      index = i;
      const fn = middlewares[i] || next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(params, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
```
1. 调用 compose 方法返回的事 wrapMiddlewares 方法
2. 调用返回的方法返回了 dispatch 的执行。 可以看出这个 dispatc 方法调用返回了  Promise.resolve()

通过链式调用的方法来发送请求，执行中间件，拦截器。

那么这个请求这里就在于

```javaScript
// core.js 文件中
import fetchMiddleware from './middleware/fetch';

const coreMiddlewares = [fetchMiddleware];

// 这个就是 onion 的内核中间件
//  static coreMiddlewares = [];
 
```