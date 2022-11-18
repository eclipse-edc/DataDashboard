import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

export interface AppConfig {
  id: string
  apiKey: string;
  catalogUrl: string;
  dataManagementApiUrl: string;
  theme: string;
  name: string;
  logo: string;
  storages: StorageOption[];
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

  constructor(private http: HttpClient) {
  }

  loadConfig(): Promise<void> {
    return this.http
      .get<AppConfig[]>('/assets/config/app.config.json')
      .toPromise()
      .then(data => {
        let id = localStorage.getItem(this.dataDashboardId) ?? "lmis";
        this.config = data?.find(c => c.id === id)
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
