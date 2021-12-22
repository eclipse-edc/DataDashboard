import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Asset } from '../models/asset';
import { DataRequest } from '../models/api/data-request';
import { TransferProcess } from '../models/api/transfer-process';
import { StorageType } from '../models/api/storage-type';
import { TransferProcessCreation } from '../models/api/transfer-process-creation';
import { Policy } from '../models/api/policy';
import { ContractDefinition } from '../models/api/contract-definition';
import { AssetEntry } from '../models/api/asset-entry';
import { Health } from '../models/api/health';


@Injectable({
  providedIn: 'root'
})
export class EdcDemoApiService {

  private apiBaseUrl = '';

  constructor(private httpClient: HttpClient, @Inject('HOME_CONNECTOR_BASE_URL') homeConnectorBaseUrl: string) {
    this.apiBaseUrl = `${homeConnectorBaseUrl}/api/edc-demo`;
  }

  get<T>(urlPath: string, 
      params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
      : Observable<T> {  
        urlPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
        const url = `${this.apiBaseUrl}${urlPath}`;
        return this.catchError(this.httpClient.get<T>(url, { params }), url, 'GET');
  }

  post<T>(urlPath: string, body: object)
    : Observable<T> {  
      const url = `${this.apiBaseUrl}${urlPath}`;
      return this.catchError(this.httpClient.post<T>(url, body), url, 'POST');
  }

  put<T>(urlPath: string, body: object)
    : Observable<T> {  
      const url = `${this.apiBaseUrl}${urlPath}`;
      return this.catchError(this.httpClient.put<T>(url, body), url, 'PUT');
  }

  catchError<T>(observable: Observable<T>, url: string, method: string): Observable<T> {
    return observable
      .pipe(
        catchError((httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof Error) {
            console.error(`Error accessing URL '${url}', Method: 'GET', Error: '${httpErrorResponse.error.message}'`);
          } else {
            console.error(`Unsuccessful status code accessing URL '${url}', Method: 'GET', StatusCode: '${httpErrorResponse.status}', Error: '${httpErrorResponse.error?.message}'`);
          }

          return EMPTY;
        }));
  }

  getHealth(): Observable<Health> {
    return this.get<Health>('/health');
  }

  getAssets(): Observable<Asset[]> {
    return this.get<Asset[]>('/assets')
      .pipe(map((assets) => assets.map(asset => new Asset(asset.properties))));
  }

  getDataRequests(): Observable<DataRequest[]> {
    return this.get<DataRequest[]>('/data-requests');
  }

  getTransferProcesses(): Observable<TransferProcess[]> {
    return this.get<TransferProcess[]>('/transfer-processes');
  }

  getTransferProcessesById(id: string): Observable<TransferProcess> {
    return this.get<TransferProcess>(`/transfer-processes/${id}`);
  }

  getStorageTypes(): Observable<StorageType[]> {
    return this.get<StorageType[]>('/storage-types');
  }

  getPolicies(): Observable<Policy[]> {
    return this.get<Policy[]>('/policies');
  }

  getContractDefinitions(): Observable<ContractDefinition[]> {
    return this.get<ContractDefinition[]>('/contract-definitions');
  }

  createTransferProcess(transferProcessCreation: TransferProcessCreation): Observable<TransferProcess> {
    return this.post<TransferProcess>('/transfer-processes', transferProcessCreation);
  }

  createContractDefinition(contractDefinition: ContractDefinition): Observable<ContractDefinition> {
    return this.post<ContractDefinition>('/contract-definitions', contractDefinition);
  }

  updateContractDefinition(contractDefinition: ContractDefinition): Observable<ContractDefinition> {
    return this.put<ContractDefinition>(`/contract-definitions/${contractDefinition.id}`, contractDefinition);
  }

  createAssetEntry(assetEntry: AssetEntry): Observable<AssetEntry> {
    return this.post<AssetEntry>('/asset-entries', assetEntry);
  }
}
