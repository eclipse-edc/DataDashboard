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
import {API_KEY, CONNECTOR_CATALOG_API, CONNECTOR_DATAMANAGEMENT_API} from "../edc-dmgmt-client";
import {MatSnackBarModule} from "@angular/material/snack-bar";


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
      useFactory: (s: AppConfigService) => s.getConfig()?.dataManagementApiUrl,
      deps: [AppConfigService]
    },
    {
      provide: CONNECTOR_CATALOG_API,
      useFactory: (s: AppConfigService) => s.getConfig()?.catalogUrl,
      deps: [AppConfigService]
    },
    {
      provide: 'HOME_CONNECTOR_STORAGE_ACCOUNT',
      useFactory: (s: AppConfigService) => s.getConfig()?.storageAccount,
      deps: [AppConfigService]
    },
    {provide: API_KEY, useFactory: (s: AppConfigService) => s.getConfig()?.apiKey, deps: [AppConfigService]},
    {
      provide: 'STORAGE_TYPES',
      useFactory: () => [{id: "AzureStorage", name: "AzureStorage"}, {id: "AmazonS3", name: "AmazonS3"}],
    },
    {
      provide: 'AWS_REGIONS',
      useFactory: () => ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "ap-south-1", "ap-northeast-3", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ca-central-1", "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1", "sa-east-1", "af-south-1", "ap-east-1", "ap-south-2", "ap-southeast-3", "eu-south-1", "eu-south-2", "eu-central-2", "me-south-1", "me-central-1"],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
