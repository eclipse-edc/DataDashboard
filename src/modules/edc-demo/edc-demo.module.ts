import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogBrowserComponent } from './components/catalog-browser/catalog-browser.component';
import { TransferHistoryViewerComponent } from './components/transfer-history/transfer-history-viewer.component';
import { PolicyEditorComponent } from './components/policy-editor/policy-editor.component';
import { AssetPublisherComponent } from './components/asset-publisher/asset-publisher.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { RouterModule } from '@angular/router';
import { PolicyEditorDialog } from './components/policy-editor-dialog/policy-editor-dialog.component';
import { CatalogBrowserTransferDialog } from './components/catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component';


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
    RouterModule
  ],
  declarations: [
    CatalogBrowserComponent,
    TransferHistoryViewerComponent,
    PolicyEditorComponent,
    AssetPublisherComponent,
    IntroductionComponent,
    PolicyEditorDialog,
    CatalogBrowserTransferDialog
  ],
  exports: [
    CatalogBrowserComponent,
    TransferHistoryViewerComponent,
    PolicyEditorComponent,
    AssetPublisherComponent,
    IntroductionComponent
  ]
})
export class EdcDemoModule { }
