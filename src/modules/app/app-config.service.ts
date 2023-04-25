import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable} from "rxjs";
import {API_KEY, BACKEND_URL} from "../edc-dmgmt-client";
import { AuthenticationService } from './core/authentication/authentication.service';

export interface AppConfig {
  name: string
  catalogUrl: string;
  dataConnectorUrl: string;
  theme: string;
  logoUrl: string;
  storages: StorageOption[];
  firstName: string;
  lastName: string;
  url: string;
}

export interface StorageOption {
  "label": string;
  "type": string;
  "region": string;

  "additionalTextFields": AdditionalTextField[],
}

export interface AdditionalTextField {
  "id": string;
  "label": string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  config?: AppConfig;
  allConfigs: BehaviorSubject<AppConfig[]> = new BehaviorSubject<AppConfig[]>([]);
  private dataDashboardId = "data-dashboard-id.v2";

  constructor(private http: HttpClient,
              @Inject(BACKEND_URL) private catalogApiUrl: string,
              @Inject(API_KEY) private apiKey: string,
              private authenticationService: AuthenticationService
  ) {
  }

  loadConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authenticationService.userProfile$.subscribe(userProfile => {
        if (!userProfile) {
          throw new Error('UserProfile is null or undefined.');
        }
        const firstName = userProfile!.firstName;
        console.log(`First name: ${firstName}`);
  
        const headers = new HttpHeaders({'X-Api-Key': this.apiKey, "Origin": "agrigaia"});
  
        firstValueFrom(this.http.get<AppConfig>(`${this.catalogApiUrl}/dataspaceparticipants/{firstName}`, {headers}))
          .then(data => {
            this.config = data;
            resolve();
          });
      });
    });
  }

  getConfig(): AppConfig | undefined {
    return this.config;
  }

  getAllConfigs(): Observable<AppConfig[]> {
    return this.allConfigs;
  }

  setCurId(id: string) {
    localStorage.setItem(this.dataDashboardId, id);
    window.location.reload();
  }
}
