import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Asset} from '../models/asset';
import {ContractOffer} from '../models/api/contract-offer';
import {
  ContractAgreementDto,
  ContractNegotiationDto,
  ContractNegotiationService,
  NegotiationInitiateRequestDto,
  TransferProcessDto,
  TransferProcessService,
  TransferRequestDto
} from "../../edc-dmgmt-client";


/**
 * Combines several services that are used from the {@link CatalogBrowserComponent}
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogBrowserService {

  private readonly apiBaseUrl: string;

  constructor(private httpClient: HttpClient,
              private transferProcessService: TransferProcessService,
              private negotiationService: ContractNegotiationService,
              @Inject('API_KEY') private apiKey: string,
              @Inject('HOME_CONNECTOR_BASE_URL') private homeConnectorBaseUrl: string) {
    this.apiBaseUrl = `${homeConnectorBaseUrl}/catalog`;
  }

  getContractOffers(): Observable<ContractOffer[]> {
    return this.get<ContractOffer[]>('/contract-offers')
      .pipe(map((contractOffers) => contractOffers.map(contractOffer => {
        contractOffer.asset = new Asset(contractOffer.asset.properties)
        return contractOffer;
      })));
  }

  initiateTransfer(transferRequest: TransferRequestDto): Observable<string> {
    return this.transferProcessService.initiateTransfer(transferRequest)
  }

  getTransferProcessesById(id: string): Observable<TransferProcessDto> {
    return this.transferProcessService.getTransferProcess(id);
  }

  initiateNegotiation(initiateDto: NegotiationInitiateRequestDto): Observable<string> {
    return this.negotiationService.initiateContractNegotiation(initiateDto, 'body', false,)
  }

  getNegotiationState(id: string): Observable<ContractNegotiationDto> {
    return this.negotiationService.getNegotiation(id);
  }

  getAgreementForNegotiation(contractId: string): Observable<ContractAgreementDto> {
    return this.negotiationService.getAgreementForNegotiation(contractId);
  }

  private get<T>(urlPath: string,
                 params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    urlPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    const url = `${this.apiBaseUrl}${urlPath}`;
    let headers = new HttpHeaders({'X-Api-Key': this.apiKey});
    return this.catchError(this.httpClient.get<T>(url, {headers, params}), url, 'GET');
  }

  private catchError<T>(observable: Observable<T>, url: string, method: string): Observable<T> {
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
}
