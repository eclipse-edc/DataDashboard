import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetViewerComponent} from '../edc-demo/components/asset-viewer/asset-viewer.component';
import {CatalogBrowserComponent} from '../edc-demo/components/catalog-browser/catalog-browser.component';
import {IntroductionComponent} from '../edc-demo/components/introduction/introduction.component';
import {
  ContractDefinitionViewerComponent
} from '../edc-demo/components/contract-definition-viewer/contract-definition-viewer.component';
import {
  TransferHistoryViewerComponent
} from '../edc-demo/components/transfer-history/transfer-history-viewer.component';
import {PolicyViewComponent} from "../edc-demo/components/policy-view/policy-view.component";
import {ContractViewerComponent} from "../edc-demo/components/contract-viewer/contract-viewer.component";

export const routes: Routes = [
  {
    path: 'dashboard',
    component: IntroductionComponent,
    data: {title: 'Dashboard', icon: 'info_outline'}
  },
  {
    path: 'catalog-browser',
    component: CatalogBrowserComponent,
    data: {title: 'Catalog Browser', icon: 'sim_card', isConsumerMode:true}
  },
  {
    path: 'contracts',
    component: ContractViewerComponent,
    data: {title: 'Contracts', icon: 'attachment', isConsumerMode: true}
  },
  {
    path: 'transfer-history',
    component: TransferHistoryViewerComponent,
    data: {title: 'Transfer History', icon: 'assignment', isConsumerMode: true}
  },
  {
    path: 'contract-definitions',
    component: ContractDefinitionViewerComponent,
    data: {title: 'Contract Definitions', icon: 'rule', isConsumerMode: false}
  },
  {
    path: 'policies',
    component: PolicyViewComponent,
    data: {title: 'Policies', icon: 'policy', isConsumerMode: false}
  },
  {
    path: 'my-assets', // must not be "assets" to prevent conflict with assets directory
    component: AssetViewerComponent,
    data: {title: 'Assets', icon: 'upload', isConsumerMode: false}
  },
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
