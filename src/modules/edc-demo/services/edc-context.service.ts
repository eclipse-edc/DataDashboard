import {Injectable} from '@angular/core';
import {AppConfigService} from "../../app/app-config.service";

@Injectable({
  providedIn: 'root'
})
export class EdcContextService {

  constructor(private appConfigService: AppConfigService) {
  }

  switchConfig(){
    this.appConfigService.getConfig()?.theme
  }
  // Load saved service on application load

  // Switch Service -> save as well
}
