'use strict';

var undici = require('undici');
var node_process = require('node:process');

/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

// as long as an agent has a reference to it, its associated dispatcher will
// be kept in this cache for reuse
const AGENT_CACHE = new WeakMap();

// can only convert agent to dispatcher option on node 18.2+
const [major, minor] = node_process.versions.node.split('.').map(v => parseInt(v, 10));
const canConvert = (major > 18) || (major === 18 && minor >= 2);

// converts `agent`/`httpsAgent` option to a dispatcher option
function convertAgent(options) {
  if(!canConvert) {
    return options;
  }

  // do not override custom fetch function from another lib
  if(options?.fetch && !options.fetch._httpClientCustomFetch) {
    return options;
  }

  // only override if an agent option is present
  const agent = options?.agent || options?.httpsAgent;
  if(!agent) {
    return options;
  }

  // use custom fetch if agent has already been converted
  let fetch = AGENT_CACHE.get(agent);
  if(!fetch) {
    const dispatcher = new undici.Agent({connect: agent.options});
    fetch = createFetch(dispatcher);
    fetch._httpClientCustomFetch = true;
    AGENT_CACHE.set(agent, fetch);
  }

  return {...options, fetch};
}

// create fetch override uses custom `dispatcher`; since `ky` does not pass
// the dispatcher option through to `fetch`, we must use this override
function createFetch(dispatcher) {
  return function fetch(...args) {
    dispatcher = (args[1] && args[1].dispatcher) || dispatcher;
    args[1] = {...args[1], dispatcher};
    // eslint-disable-next-line no-undef
    return globalThis.fetch(...args);
  };
}

function deferred(f) {
  let promise;

  return {
    then(
      onfulfilled,
      onrejected
    ) {
      // Use logical OR assignment when Node.js 14.x support is dropped
      //promise ||= new Promise(resolve => resolve(f()));
      promise || (promise = new Promise(resolve => resolve(f())));
      return promise.then(
        onfulfilled,
        onrejected
      );
    },
  };
}

/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */

const kyOriginalPromise = deferred(() => import('ky-universal')
  .then(({default: ky}) => ky));

const DEFAULT_HEADERS = {
  Accept: 'application/ld+json, application/json'
};

// methods to proxy from ky
const PROXY_METHODS = new Set([
  'get', 'post', 'put', 'push', 'patch', 'head', 'delete'
]);

/**
 * Returns a custom httpClient instance. Used to specify default headers and
 * other default overrides.
 *
 * @param {object} [options={}] - Options hashmap.
 * @param {object} [options.parent] - The ky promise to inherit from.
 * @param {object} [options.headers={}] - Default header overrides.
 * @param {object} [options.params] - Other default overrides.
 *
 * @returns {Function} Custom httpClient instance.
 */
function createInstance({
  parent = kyOriginalPromise, headers = {}, ...params
} = {}) {
  // convert legacy agent options
  params = convertAgent(params);

  // create new ky instance that will asynchronously resolve
  const kyPromise = deferred(() => parent.then(kyBase => {
    let ky;
    if(parent === kyOriginalPromise) {
      // ensure default headers, allow overrides
      ky = kyBase.create({
        headers: {...DEFAULT_HEADERS, ...headers},
        ...params
      });
    } else {
      // extend parent
      ky = kyBase.extend({headers, ...params});
    }
    return ky;
  }));

  return _createHttpClient(kyPromise);
}

function _createHttpClient(kyPromise) {
  async function httpClient(...args) {
    const ky = await kyPromise;
    const method = ((args[1] && args[1].method) || 'get').toLowerCase();
    if(PROXY_METHODS.has(method)) {
      return httpClient[method].apply(ky[method], args);
    }

    // convert legacy agent options
    args[1] = convertAgent(args[1]);
    return ky.apply(ky, args);
  }

  for(const method of PROXY_METHODS) {
    httpClient[method] = async function(...args) {
      const ky = await kyPromise;
      return _handleResponse(ky[method], ky, args);
    };
  }

  httpClient.create = function({headers = {}, ...params}) {
    return createInstance({headers, ...params});
  };

  httpClient.extend = function({headers = {}, ...params}) {
    return createInstance({parent: kyPromise, headers, ...params});
  };

  // default async `stop` signal getter
  Object.defineProperty(httpClient, 'stop', {
    async get() {
      const ky = await kyPromise;
      return ky.stop;
    }
  });

  return httpClient;
}

async function _handleResponse(target, thisArg, args) {
  // convert legacy agent options
  args[1] = convertAgent(args[1]);

  let response;
  const [url] = args;
  try {
    response = await target.apply(thisArg, args);
  } catch(error) {
    return _handleError({error, url});
  }
  const {parseBody = true} = args[1] || {};
  // always set 'data', default to undefined
  let data;
  if(parseBody) {
    // a 204 will not include a content-type header
    const contentType = response.headers.get('content-type');
    if(contentType && contentType.includes('json')) {
      data = await response.json();
    }
  }
  Object.defineProperty(response, 'data', {value: data});
  return response;
}

/**
 * @param {object} options - Options hashmap.
 * @param {Error} options.error - Error thrown during http operation.
 * @param {string} options.url - Target URL of the request.
 *
 * @returns {Promise} Rejects with a thrown error.
 */
async function _handleError({error, url}) {
  error.requestUrl = url;

  // handle network errors and system errors that do not have a response
  if(!error.response) {
    if(error.message === 'Failed to fetch') {
      error.message = `Failed to fetch "${url}". Possible CORS error.`;
    }
    // ky's TimeoutError class
    if(error.name === 'TimeoutError') {
      error.message = `Request to "${url}" timed out.`;
    }

    throw error;
  }

  // always move status up to the root of error
  error.status = error.response.status;

  const contentType = error.response.headers.get('content-type');
  if(contentType && contentType.includes('json')) {
    const errorBody = await error.response.json();
    // the HTTPError received from ky has a generic message based on status
    // use that if the JSON body does not include a message
    error.message = errorBody.message || error.message;
    error.data = errorBody;
  }
  throw error;
}

/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */

const httpClient = createInstance();

exports.DEFAULT_HEADERS = DEFAULT_HEADERS;
exports.httpClient = httpClient;
exports.kyPromise = kyOriginalPromise;
