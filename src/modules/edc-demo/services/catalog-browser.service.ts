import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map, reduce} from 'rxjs/operators';
import {Asset} from '../models/asset';
import {ContractOffer} from '../models/contract-offer';
import {
  ContractNegotiationDto,
  ContractNegotiationService,
  NegotiationInitiateRequestDto,
  Policy,
  TransferProcessDto,
  TransferProcessService,
  TransferRequestDto,
} from "../../mgmt-api-client";
import {CONNECTOR_CATALOG_API, CONNECTOR_MANAGEMENT_API} from "../../app/variables";
import TypeEnum = Policy.TypeEnum;


/**
 * Combines several services that are used from the {@link CatalogBrowserComponent}
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogBrowserService {

  constructor(private httpClient: HttpClient,
              private transferProcessService: TransferProcessService,
              private negotiationService: ContractNegotiationService,
              @Inject(CONNECTOR_MANAGEMENT_API) private managementApiUrl: string,
              @Inject(CONNECTOR_CATALOG_API) private catalogApiUrl: string) {
  }

  getContractOffers(): Observable<ContractOffer[]> {
    let url = this.catalogApiUrl || this.managementApiUrl;
    return this.post<ContractOffer[]>(url + "/federatedcatalog")
      .pipe(map(contractOffers => contractOffers.map(contractOffer => {
        const arr = Array<ContractOffer>();
        let isFirst = true;
        //divides multiple offers in dataSets into separate contractOffers.
        for(let i = 0; i<contractOffer["dcat:dataset"].length; i++){
          const dataSet: any = contractOffer["dcat:dataset"][i];
          const properties: { [key: string]: string; } = {
            "edc:id": dataSet["edc:id"],
            "edc:name": dataSet["edc:name"],
            "edc:version": dataSet["edc:version"],
            "type": dataSet["edc:type"],
            "edc:contenttype": dataSet["edc:contenttype"],
            "edc:originator": contractOffer["edc:originator"]
          }
          const asset: Asset = new Asset(properties);

          let id: string = "";
          let policy: Policy = {
            //currently hardcoded to SET since parsed type is {"@policytype": "set"}
            "@type": TypeEnum.Set,
            "@id": dataSet["odrl:hasPolicy"]["@id"],
            "assignee": dataSet["odrl:hasPolicy"]["assignee"],
            "assigner": dataSet["odrl:hasPolicy"]["assigner"],
            "odrl:obligation": dataSet["odrl:hasPolicy"]["odrl:obligations"],
            "odrl:permission": dataSet["odrl:hasPolicy"]["odrl:permissions"],
            "odrl:prohibition": dataSet["odrl:hasPolicy"]["odrl:prohibitions"],
            "odrl:target": dataSet["odrl:hasPolicy"]["odrl:target"]
          };

          if(isFirst){
            contractOffer.id = dataSet["odrl:hasPolicy"]["@id"];
            contractOffer.asset = asset
            contractOffer.policy = policy;

            arr.push(contractOffer)
            isFirst = false;
          } else {
            const newContractOffer: ContractOffer = {
              asset: asset,
              contractOffers: contractOffer.contractOffers,
              "dcat:service": contractOffer["dcat:service"],
              "dcat:dataset": contractOffer["dcat:dataset"],
              id: dataSet["odrl:hasPolicy"]["@id"],
              "edc:originator": contractOffer["edc:originator"],
              policy: policy
            };
            arr.push(newContractOffer);
          }
        }
        return arr;
      })), reduce((acc, val) => {
        for(let i = 0; i < val.length; i++){
          for(let j = 0; j < val[i].length; j++){
            acc.push(val[i][j]);
          }
        }
        return acc;
      }, new Array<ContractOffer>()));
  }

  initiateTransfer(transferRequest: TransferRequestDto): Observable<string> {
    return this.transferProcessService.initiateTransfer(transferRequest).pipe(map(t => t["@id"]!))
  }

  getTransferProcessesById(id: string): Observable<TransferProcessDto> {
    return this.transferProcessService.getTransferProcess(id);
  }

  initiateNegotiation(initiateDto: NegotiationInitiateRequestDto): Observable<string> {
    return this.negotiationService.initiateContractNegotiation(initiateDto, 'body', false,).pipe(map(t => t["@id"]!))
  }

  getNegotiationState(id: string): Observable<ContractNegotiationDto> {
    return this.negotiationService.getNegotiation(id);
  }

  private post<T>(urlPath: string,
                  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    const url = `${urlPath}`;
    let headers = new HttpHeaders({"Content-type": "application/json"});
    return this.catchError(this.httpClient.post<T>(url, "{\"edc:operandLeft\": \"\",\"edc:operandRight\": \"\",\"edc:operator\": \"\",\"edc:Criterion\":\"\"}", {headers, params}), url, 'POST');
  }

  private catchError<T>(observable: Observable<T>, url: string, method: string): Observable<T> {
    return observable
      .pipe(
        catchError((httpErrorResponse: HttpErrorResponse) => {
          if (httpErrorResponse.error instanceof Error) {
            console.error(`Error accessing URL '${url}', Method: 'GET', Error: '${httpErrorResponse.error.message}'`);
          } else {
            console.error(`Unsuccessful status code accessing URL '${url}', Method: '${method}', StatusCode: '${httpErrorResponse.status}', Error: '${httpErrorResponse.error?.message}'`);
          }

          return EMPTY;
        }));
  }
}
