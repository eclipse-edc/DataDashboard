import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetViewerComponent} from '../edc-demo/components/asset/asset-viewer/asset-viewer.component';
import {CatalogBrowserComponent} from '../edc-demo/components/catalog-browser/catalog-browser.component';
import {IntroductionComponent} from '../edc-demo/components/introduction/introduction.component';
import {
  ContractDefinitionViewerComponent
} from '../edc-demo/components/contract/contract-definition-viewer/contract-definition-viewer.component';
import {
  TransferHistoryViewerComponent
} from '../edc-demo/components/transfer-history/transfer-history-viewer.component';
import {PolicyViewComponent} from "../edc-demo/components/policy/policy-view/policy-view.component";
import {ContractViewerComponent} from "../edc-demo/components/contract-viewer/contract-viewer.component";

export const routes: Routes = [
  {
    path: 'catalog-browser',
    component: CatalogBrowserComponent,
    data: { title: 'route.catalogBrowser', icon: 'sim_card'}
  },
  {
    path: 'contracts',
    component: ContractViewerComponent,
    data: { title: 'route.contracts', icon: 'attachment'}
  },
  {
    path: 'transfer-history',
    component: TransferHistoryViewerComponent,
    data: { title: 'route.transferHistory', icon: 'assignment'}
  },
  {
    path: 'contract-definitions',
    component: ContractDefinitionViewerComponent,
    data: { title: 'route.contractDefinitions', icon: 'rule'}
  },
  {
    path: 'policies',
    component: PolicyViewComponent,
    data: { title: 'route.policies', icon: 'policy'}
  },
  {
    path: 'my-assets', // must not be "assets" to prevent conflict with assets directory
    component: AssetViewerComponent,
    data: { title: 'route.myAssets', icon: 'upload'}
  },
  {
    path: '', redirectTo: 'my-assets', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
