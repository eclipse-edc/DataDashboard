import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetPublisherComponent} from '../edc-demo/components/asset-publisher/asset-publisher.component';
import {CatalogBrowserComponent} from '../edc-demo/components/catalog-browser/catalog-browser.component';
import {IntroductionComponent} from '../edc-demo/components/introduction/introduction.component';
import {
  ContractDefinitionEditorComponent
} from '../edc-demo/components/contractdefinition-editor/contractdefinition-editor.component';
import {
  TransferHistoryViewerComponent
} from '../edc-demo/components/transfer-history/transfer-history-viewer.component';
import {ContractViewerComponent} from "../edc-demo/components/contract-viewer/contract-viewer.component";

export const routes: Routes = [
  {
    path: 'introduction', component: IntroductionComponent, data: {title: 'Getting Started', icon: 'info_outline'}
  },
  {
    path: 'catalog-browser', component: CatalogBrowserComponent, data: {title: 'Dataspace Catalog', icon: 'sim_card'}
  },
  {
    path: 'contract-viewer',
    component: ContractViewerComponent,
    data: {title: 'Contract Viewer', icon: 'attachment'}
  },
  {
    path: 'transfer-history-viewer',
    component: TransferHistoryViewerComponent,
    data: {title: 'Transfer History', icon: 'assignment'}
  },
  {
    path: 'contractdefinition-editor',
    component: ContractDefinitionEditorComponent,
    data: {title: 'Contract Definition Editor', icon: 'rule'}
  },
  {
    path: 'asset-publisher', component: AssetPublisherComponent, data: {title: 'Data Publisher', icon: 'upload'}
  },
  {
    path: '', redirectTo: 'introduction', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
