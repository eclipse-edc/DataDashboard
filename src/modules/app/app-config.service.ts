import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable} from "rxjs";
import {API_KEY, BACKEND_URL} from "../edc-dmgmt-client";

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
  ) {
  }

  loadConfig(): Promise<void> {
    const headers = new HttpHeaders({'X-Api-Key': this.apiKey, "Origin": "agrigaia"});

    return firstValueFrom(this.http.get<AppConfig[]>(`${this.catalogApiUrl}/dataspaceparticipants`, {headers}))
      .then(data => {
        let name = localStorage.getItem(this.dataDashboardId) ?? "lmis";
        this.config = data?.find(c => c.name === name)
        this.allConfigs.next(data!);
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
