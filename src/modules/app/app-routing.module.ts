import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetPublisherComponent } from '../edc-demo/components/asset-publisher/asset-publisher.component';
import { CatalogBrowserComponent } from '../edc-demo/components/catalog-browser/catalog-browser.component';
import { IntroductionComponent } from '../edc-demo/components/introduction/introduction.component';
import { PolicyEditorComponent } from '../edc-demo/components/policy-editor/policy-editor.component';
import { TransferHistoryViewerComponent } from '../edc-demo/components/transfer-history/transfer-history-viewer.component';

export const routes: Routes = [
  {
    path: 'introduction', component: IntroductionComponent, data: { title: 'Introduction', icon: 'info_outline' }
  },
  {
    path: 'catalog-browser', component: CatalogBrowserComponent, data: { title: 'Catalog Browser', icon: 'sim_card' }
  },
  {
    path: 'policy-editor', component: PolicyEditorComponent, data: { title: 'Policy Editor', icon: 'rule' }
  },
  {
    path: 'transfer-history-viewer', component: TransferHistoryViewerComponent, data: { title: 'Transfer History Viewer', icon: 'assignment' }
  },
  {
    path: 'asset-publisher', component: AssetPublisherComponent, data: { title: 'Asset Publisher', icon: 'upload' }
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
