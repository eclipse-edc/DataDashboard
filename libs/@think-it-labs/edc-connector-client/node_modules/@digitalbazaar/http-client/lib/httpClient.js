/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {convertAgent} from './agentCompatibility.js';
import {deferred} from './deferred.js';

export const kyOriginalPromise = deferred(() => import('ky-universal')
  .then(({default: ky}) => ky));

export const DEFAULT_HEADERS = {
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
export function createInstance({
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
