import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Asset} from '../models/asset';
import {ContractOffer} from '../models/contract-offer';
import {
  API_KEY,
  BACKEND_URL,
  ContractNegotiationDto,
  ContractNegotiationService, ContractOfferDescription,
  NegotiationInitiateRequestDto,
  TransferProcessDto,
  TransferProcessService,
  TransferRequestDto
} from "../../edc-dmgmt-client";
import {SearchParams} from "../pages/frame/app-toolbar/app-toolbar.component";

type Operand = 'label' | 'startDate' | 'endDate' | 'location';
type Operator = 'equals' | 'contains' | '>' | '<' | '>=' | '<=' | '=' | 'and' | 'or';

interface SearchBody {
  operandLeft: SearchBody | Operand;
  operator: Operator;
  operandRight: SearchBody | string;
}

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
              @Inject(API_KEY) private apiKey: string,
              @Inject(BACKEND_URL) private catalogApiUrl: string) {
  }

  private cataloguePath = `${this.catalogApiUrl}/contractoffers`;

  getContractOffers(): Observable<ContractOffer[]> {
    return this.post<ContractOffer[]>(this.cataloguePath)
      .pipe(map(contractOffers => contractOffers.map(contractOffer => {
        contractOffer.asset = new Asset(contractOffer.asset.properties)
        return contractOffer;
      })));
  }


  getFilteredContractOffers(searchTerm: SearchParams): Observable<ContractOffer[]> {
    let operandLeft: SearchBody = {
      operandLeft: 'label',
      operator: 'contains',
      operandRight: searchTerm.label
    };
    let operandRight: SearchBody = {
      operandLeft: 'location',
      operator: 'contains',
      operandRight: searchTerm.location
    };
    let searchBody = this.appendSearchBodyTo(operandLeft)
    searchBody = this.appendSearchBodyTo(operandRight, searchBody)

    if (!searchBody) {
      return this.getContractOffers();
    }

    return this.postWithBody<ContractOffer[]>(this.cataloguePath, {where: searchBody})
      .pipe(map(contractOffers => contractOffers.map(contractOffer => {
        contractOffer.asset = new Asset(contractOffer.asset.properties)
        return contractOffer;
      })));
  }

  private appendSearchBodyTo(toAppend: SearchBody, baseBody?: SearchBody): SearchBody | undefined {
    if (!baseBody) {
      if (toAppend.operandRight === "" || toAppend.operandRight === null || toAppend.operandRight === undefined) {
        return undefined;
      }
      return toAppend;
    }

    if (toAppend.operandRight === "" || toAppend.operandRight === null || toAppend.operandRight === undefined) {
      return baseBody;
    }

    return {
      operandLeft: baseBody,
      operator: "and",
      operandRight: toAppend
    };
  }

  initiateTransfer(transferRequest: TransferRequestDto): Observable<string> {
    return this.transferProcessService.initiateTransfer(transferRequest).pipe(map(t => t.id!))
  }

  getTransferProcessesById(id: string): Observable<TransferProcessDto> {
    return this.transferProcessService.getTransferProcess(id);
  }

  initiateNegotiation(initiateDto: NegotiationInitiateRequestDto): Observable<string> {
    return this.negotiationService.initiateContractNegotiation(initiateDto, 'body', false,).pipe(map(t => t.id!))
  }

  getNegotiationState(id: string): Observable<ContractNegotiationDto> {
    return this.negotiationService.getNegotiation(id);
  }

  getAgreementForNegotiation(contractId: string): Observable<ContractNegotiationDto> {
    return this.negotiationService.getAgreementForNegotiation(contractId);
  }

  private post<T>(urlPath: string,
                  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    const url = `${urlPath}`;
    let headers = new HttpHeaders({'X-Api-Key': this.apiKey});
    return this.catchError(this.httpClient.post<T>(url, {}, {headers, params}), url, 'POST');
  }

  private postWithBody<T>(urlPath: string,
                          body: any,
                          params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
    : Observable<T> {
    const url = `${urlPath}`;
    let headers = new HttpHeaders({'X-Api-Key': this.apiKey});
    return this.catchError(this.httpClient.post<T>(url, body, {headers, params}), url, 'POST');
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
