import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {KeycloakService} from "keycloak-angular";
import {AppConfigService} from "./app-config.service";

@Injectable()
export class EdcApiKeyInterceptor implements HttpInterceptor {
  constructor(private configService: AppConfigService,
              private keycloak: KeycloakService) {
  }


  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(value: string) {
    this._apiKey = value;
  }

  protected _apiKey: string = "";

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const token = this.keycloak.getKeycloakInstance().token;
    // return next.handle(httpRequest.clone({
    //   setHeaders: {
    //     Authorization: `Bearer ${token}`
    //   }
    // }));
    this._apiKey = this.configService.getConfig()?.apiKey ?? '';
    return next.handle(httpRequest.clone({
        setHeaders: {
          "X-Api-Key": this._apiKey
        }
    }));
  }
}
