/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {
  createInstance,
  DEFAULT_HEADERS,
  kyOriginalPromise
} from './httpClient.js';

export {kyOriginalPromise as kyPromise, DEFAULT_HEADERS};

export const httpClient = createInstance();
