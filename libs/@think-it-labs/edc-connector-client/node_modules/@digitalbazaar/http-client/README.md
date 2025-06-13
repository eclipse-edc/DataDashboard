# http-client
An opinionated, isomorphic HTTP client.

### Usage

#### Import httpClient
```js
import https from 'https';
import {httpClient} from '@digitalbazaar/http-client';
```

#### Import and initialize a custom Bearer Token client
```js
import {httpClient} from '@digitalbazaar/http-client';

const httpsAgent = new https.Agent({rejectUnauthorized: false});

const accessToken = '12345';
const headers = {Authorization: `Bearer ${accessToken}`};

const client = httpClient.extend({headers, httpsAgent});

// subsequent http calls will include an 'Authorization: Bearer 12345' header,
// and use the provided httpsAgent
```

#### GET a JSON response in the browser
```js
try {
  const response = await httpClient.get('http://httpbin.org/json');
  return response.data;
} catch(e) {
  // status is HTTP status code
  // data is JSON error from the server
  const {data, status} = e;
  throw e;
}
```

#### GET a JSON response in Node with a HTTP Agent
```js
import https from 'https';
// use an agent to avoid self-signed certificate errors
const agent = new https.Agent({rejectUnauthorized: false});
try {
  const response = await httpClient.get('http://httpbin.org/json', {agent});
  return response.data;
} catch(e) {
  // status is HTTP status code
  // data is JSON error from the server if available
  const {data, status} = e;
  throw e;
}
```

#### GET HTML by overriding default headers
```js
const headers = {Accept: 'text/html'};
try {
  const response = await httpClient.get('http://httpbin.org/html', {headers});
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Response#methods
  return response.text();
} catch(e) {
  // status is HTTP status code
  // any message from the server can be parsed from the response if present
  const {response, status} = e;
  throw e;
}
```

#### POST a JSON payload
```js
try {
  const response = await httpClient.post('http://httpbin.org/json', {
    // `json` is the payload or body of the POST request
    json: {some: 'data'}
  });
  return response.data;
} catch(e) {
  // status is HTTP status code
  // data is JSON error from the server
  const {data, status} = e;
  throw e;
}
```

#### POST a JSON payload in Node with a HTTP Agent
```js
import https from 'https';
// use an agent to avoid self-signed certificate errors
const agent = new https.Agent({rejectUnauthorized: false});
try {
  const response = await httpClient.post('http://httpbin.org/json', {
    agent,
    // `json` is the payload or body of the POST request
    json: {some: 'data'}
  });
  return response.data;
} catch(e) {
  // status is HTTP status code
  // data is JSON error from the server
  const {data, status} = e;
  throw e;
}
```
