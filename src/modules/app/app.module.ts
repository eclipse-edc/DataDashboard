import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {NavigationComponent} from './components/navigation/navigation.component';
import {EdcDemoModule} from '../edc-demo/edc-demo.module';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {API_KEY, BACKEND_URL} from "../edc-dmgmt-client";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { environment } from "src/environments/environment"



function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://account.platform.agri-gaia.com',
        realm: 'agri-gaia-marketplace',
        clientId: 'ag-test-marktplatz'
      },
      initOptions: {
        onLoad: 'login-required',
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
    });
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    EdcDemoModule,
    MatSnackBarModule,
    KeycloakAngularModule
  ],
  declarations: [
    AppComponent,
    NavigationComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    {provide: BACKEND_URL, useValue: 'https://marktplatz-backend.platform.agri-gaia.com'},
    {provide: API_KEY, useValue: '0bc87c93-3a83-4a1c-9080-ac61e0f7e75c'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
