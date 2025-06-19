import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { LocationStrategy } from '@angular/common';

export interface AppConfig {
  apiKey: string;
  managementApiUrl: string;
  catalogUrl: string;
  storageAccount: string;
  storageExplorerLinkTemplate: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  config?: AppConfig;

  constructor(private http: HttpClient, private locationStrategy: LocationStrategy) {}

  loadConfig(): Promise<void> {
    let appConfigUrl = this.locationStrategy.prepareExternalUrl('assets/config/app.config.json');

    return this.http
      .get<AppConfig>(appConfigUrl)
      .toPromise()
      .then(data => {
        this.config = data;
      });
  }

  getConfig(): AppConfig | undefined {
    return this.config;
  }
}
