import {
  ApplicationConfig,
  inject,
  Injectable,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
class BaseHrefService {
  private baseHref = '/';

  constructor(private readonly http: HttpClient) {}

  async load() {
    try {
      this.baseHref = (
        await firstValueFrom(this.http.get('config/APP_BASE_HREF.txt', { responseType: 'text' }))
      ).replace(/\n/g, '');
    } catch {
      console.debug('No base href config found. Default is "/"');
    }
  }

  get(): string {
    return this.baseHref;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(() => inject(BaseHrefService).load()),
    {
      provide: APP_BASE_HREF,
      useFactory: (svc: BaseHrefService) => svc.get(),
      deps: [BaseHrefService],
    },
  ],
};
