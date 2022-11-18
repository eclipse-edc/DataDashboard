import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CatalogBrowserComponent} from '../edc-demo/pages/catalog-browser/catalog-browser.component';
import {ContractViewerComponent} from "../edc-demo/pages/contract-viewer/contract-viewer.component";
import {
  TransferHistoryViewerComponent
} from "../edc-demo/pages/transfer-history/transfer-history-viewer.component";

export const routes: Routes = [
  {
    path: 'catalog-browser',
    component: CatalogBrowserComponent,
    data: {title: 'Katalog', icon: 'sim_card' }
  },
  {
    path: 'contracts',
    component: ContractViewerComponent,
    data: {title: 'Käufe', icon: 'attachment'}
  },
  {
    path: 'transfer-history',
    component: TransferHistoryViewerComponent,
    data: {title: 'Downloads', icon: 'assignment'}
  },
  {
    path: '', redirectTo: 'catalog-browser', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
