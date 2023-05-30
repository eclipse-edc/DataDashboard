import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatListModule} from '@angular/material/list';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CatalogBrowserComponent} from './pages/catalog-browser/catalog-browser.component';
import {TransferHistoryViewerComponent} from './pages/transfer-history/transfer-history-viewer.component';
import {RouterModule} from '@angular/router';
import {
  CatalogBrowserTransferDialog
} from './components/catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component';
import {ContractViewerComponent} from './pages/contract-viewer/contract-viewer.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SafePipe} from "./pipes/safe.pipe";
import {ReplacePipe} from "./pipes/replace.pipe";
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';

import {MatToolbarModule} from "@angular/material/toolbar";
import {AppToolbarComponent} from "./pages/frame/app-toolbar/app-toolbar.component";
import {AssetDetailsComponent} from './pages/catalog-browser/asset-details/asset-details.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatGridListModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatProgressBarModule,
    MatListModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
  declarations: [
    CatalogBrowserComponent,
    TransferHistoryViewerComponent,
    ContractViewerComponent,
    SafePipe,
    ReplacePipe,
    CatalogBrowserTransferDialog,
    ContractViewerComponent,
    ConfirmationDialogComponent,
    AppToolbarComponent,
    AssetDetailsComponent,
  ],
  exports: [
    CatalogBrowserComponent,
    TransferHistoryViewerComponent,
    ContractViewerComponent
  ]
})
export class EdcDemoModule {
}
