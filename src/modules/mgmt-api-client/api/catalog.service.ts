import {Injectable} from "@angular/core";
import {
  Catalog,
  CatalogRequest, Dataset, DatasetRequest,
  EdcConnectorClient,
} from "@think-it-labs/edc-connector-client";
import {HttpContext, HttpEvent, HttpResponse} from "@angular/common/http";
import {from, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private catalog;

  constructor(private edcConnectorClient: EdcConnectorClient) {
    this.catalog = this.edcConnectorClient.management.catalog;
  }

  public requestCatalog(catalogRequest: CatalogRequest): Observable<Catalog> {
    return from(this.catalog.request(catalogRequest))
  }

  public requestDataset(datasetRequest: DatasetRequest): Observable<Dataset> {
    return from(this.catalog.requestDataset(datasetRequest));
  }

}
