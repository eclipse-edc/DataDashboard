import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgChartsModule} from 'ng2-charts';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideAppConfig} from './core/config/app-config-initializer';
import {provideAppConfigProperty} from './core/config/app-config-injection-utils';
import {ApiKeyInterceptor} from './core/services/api/api-key.interceptor';
import {
  API_KEY,
  CONNECTOR_DATAMANAGEMENT_API,
} from './core/services/api/legacy-managent-api-client';

@NgModule({
  imports: [
    // Angular
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,

    // Angular Material
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatListModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,

    // Third Party
    NgChartsModule.forRoot(),

    // Routing
    AppRoutingModule,
  ],
  declarations: [AppComponent],
  providers: [
    provideAppConfig(),

    // Provide individual properties of config for better Angular Component APIs
    provideAppConfigProperty(CONNECTOR_DATAMANAGEMENT_API, 'managementApiUrl'),
    provideAppConfigProperty(API_KEY, 'managementApiKey'),

    {provide: HTTP_INTERCEPTORS, multi: true, useClass: ApiKeyInterceptor},
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        color: 'accent',
      } as MatFormFieldDefaultOptions,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
