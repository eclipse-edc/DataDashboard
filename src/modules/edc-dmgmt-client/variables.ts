import {InjectionToken} from '@angular/core';

export const BASE_PATH = new InjectionToken<string>('basePath');

export const BACKEND_URL = new InjectionToken<string>('BACKEND_URL');
export const API_KEY = new InjectionToken<string>('API_KEY')
export const COLLECTION_FORMATS = {
  'csv': ',',
  'tsv': '   ',
  'ssv': ' ',
  'pipes': '|'
}
