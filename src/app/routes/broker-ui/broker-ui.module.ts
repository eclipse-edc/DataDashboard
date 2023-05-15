import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {PipesAndDirectivesModule} from '../../component-library/pipes-and-directives/pipes-and-directives.module';
import {UiElementsModule} from '../../component-library/ui-elements/ui-elements.module';
import {BrokerUiRoutingModule} from './broker-ui-routing.module';
import {BrokerUiComponent} from './broker-ui.component';
import {CatalogBrowserPageModule} from './catalog-browser-page/catalog-browser-page.module';

@NgModule({
  imports: [
    // Angular
    CommonModule,

    // Angular Material
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatListModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,

    // Features
    PipesAndDirectivesModule,
    UiElementsModule,

    // Pages
    CatalogBrowserPageModule,

    // Routing
    BrokerUiRoutingModule,
  ],
  declarations: [BrokerUiComponent],
})
export class BrokerUiModule {}
