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
import {AppConfigService} from "./app-config.service";
import {API_KEY, BACKEND_URL, CONNECTOR_DATAMANAGEMENT_API,} from "../edc-dmgmt-client";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {CurrentUserComponent} from './components/navigation/current-user/current-user.component';


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
    MatSnackBarModule
  ],
  declarations: [
    AppComponent,
    NavigationComponent,
    CurrentUserComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: AppConfigService) => () => configService.loadConfig(),
      deps: [AppConfigService],
      multi: true
    },
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    {
      provide: CONNECTOR_DATAMANAGEMENT_API,
      useFactory: (s: AppConfigService) => s.getConfig()?.dataConnectorUrl,
      deps: [AppConfigService]
    },
    {provide: BACKEND_URL, useValue: 'http://20.103.180.67:8080'},
    {
      provide: 'HOME_CONNECTOR_STORAGES',
      useFactory: (s: AppConfigService) => s.getConfig()?.storages,
      deps: [AppConfigService]
    },
    {provide: API_KEY, useValue: "c0me_Closer"},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
