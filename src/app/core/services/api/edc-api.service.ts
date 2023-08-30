import {Inject, Injectable} from '@angular/core';
import {Observable, from} from 'rxjs';
import {
  AssetDto,
  AssetPage,
  ConnectorLimits,
  ContractAgreementPage,
  ContractAgreementTransferRequest,
  ContractDefinitionPage,
  EdcClient,
  IdResponse,
  IdResponseDto,
  PolicyDefinitionPage,
  TransferHistoryPage,
  buildEdcClient,
} from '@sovity.de/edc-client';
import {AssetCreateRequest} from '@sovity.de/edc-client/dist/generated/models/AssetCreateRequest';
import {ContractDefinitionRequest} from '@sovity.de/edc-client/dist/generated/models/ContractDefinitionRequest';
import {PolicyDefinitionCreateRequest} from '@sovity.de/edc-client/dist/generated/models/PolicyDefinitionCreateRequest';
import {APP_CONFIG, AppConfig} from '../../config/app-config';
import {EDC_FAKE_BACKEND} from './fake-backend/edc-fake-backend';

@Injectable({providedIn: 'root'})
export class EdcApiService {
  edcClient: EdcClient;

  constructor(@Inject(APP_CONFIG) private config: AppConfig) {
    this.edcClient = buildEdcClient({
      managementApiUrl: this.config.managementApiUrl,
      managementApiKey: this.config.managementApiKey,
      configOverrides: {
        fetchApi: config.useFakeBackend ? EDC_FAKE_BACKEND : undefined,
      },
    });
  }

  createAsset(
    assetCreateRequest: AssetCreateRequest,
  ): Observable<IdResponseDto> {
    return from(this.edcClient.uiApi.createAsset({assetCreateRequest}));
  }

  getAssetPage(): Observable<AssetPage> {
    return from(this.edcClient.uiApi.assetPage());
  }

  deleteAsset(assetId: string): Observable<IdResponseDto> {
    return from(this.edcClient.uiApi.deleteAsset({assetId}));
  }

  createContractDefinition(
    contractDefinitionRequest: ContractDefinitionRequest,
  ): Observable<IdResponseDto> {
    return from(
      this.edcClient.uiApi.createContractDefinition({
        contractDefinitionRequest,
      }),
    );
  }

  getContractDefinitionPage(): Observable<ContractDefinitionPage> {
    return from(this.edcClient.uiApi.contractDefinitionPage());
  }

  deleteContractDefinition(
    contractDefinitionId: string,
  ): Observable<IdResponseDto> {
    return from(
      this.edcClient.uiApi.deleteContractDefinition({contractDefinitionId}),
    );
  }

  createPolicyDefinition(
    policyDefinitionCreateRequest: PolicyDefinitionCreateRequest,
  ): Observable<IdResponseDto> {
    return from(
      this.edcClient.uiApi.createPolicyDefinition({
        policyDefinitionCreateRequest,
      }),
    );
  }

  getPolicyDefinitionPage(): Observable<PolicyDefinitionPage> {
    return from(this.edcClient.uiApi.policyDefinitionPage());
  }

  deletePolicyDefinition(policyId: string): Observable<IdResponseDto> {
    return from(this.edcClient.uiApi.deletePolicyDefinition({policyId}));
  }

  getContractAgreementPage(): Observable<ContractAgreementPage> {
    return from(this.edcClient.uiApi.contractAgreementEndpoint());
  }

  initiateTranfer(
    contractAgreementTransferRequest: ContractAgreementTransferRequest,
  ): Observable<IdResponse> {
    return from(
      this.edcClient.uiApi.initiateTransfer({contractAgreementTransferRequest}),
    );
  }

  getTransferHistoryPage(): Observable<TransferHistoryPage> {
    return from(this.edcClient.uiApi.transferHistoryPageEndpoint());
  }

  getTransferProcessAsset(transferProcessId: string): Observable<AssetDto> {
    return from(
      this.edcClient.uiApi.getTransferProcessAsset({transferProcessId}),
    );
  }

  getEnterpriseEditionConnectorLimits(): Observable<ConnectorLimits> {
    return from(this.edcClient.enterpriseEditionApi.connectorLimits());
  }
}
