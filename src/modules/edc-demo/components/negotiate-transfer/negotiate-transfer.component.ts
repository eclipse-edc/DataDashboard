import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CatalogService} from "../../../mgmt-api-client/api/catalog.service";
import {Catalog, CatalogRequest, Dataset, DatasetRequest} from "@think-it-labs/edc-connector-client";
import {NotificationService} from "../../services/notification.service";
import {ContractNegotiationService} from "../../../mgmt-api-client";
import {AppConfigService} from "../../../app/app-config.service";

@Component({
  selector: 'app-negotiate-transfer',
  templateUrl: './negotiate-transfer.component.html',
  styleUrls: ['./negotiate-transfer.component.scss']
})
export class NegotiateTransferComponent implements OnInit {

  participantId!: string;
  matchedDataset!: Dataset;
  catalogId!: string;
  endpointUrl!: string;

  title?: string;
  description?: string;
  ontologyType?: string;
  datasetId?: string;

  constructor(
    private dialogRef: MatDialogRef<NegotiateTransferComponent>,
    private catalogService: CatalogService,
    private contractNegotiationService: ContractNegotiationService,
    private notificationService: NotificationService,
    private configService: AppConfigService,
    @Inject(MAT_DIALOG_DATA) public data: { providerUrl: string; assetId: string },
  ) {}

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  ngOnInit(): void {
    this.fetchCatalog();

  }

  private fetchCatalog(): void {
    const catalogRequest: CatalogRequest = {
      providerUrl: this.data.providerUrl,
      querySpec: {
        offset: 0,
        limit: 9999,
        filterExpression: []
      }
    };

    this.catalogService.requestCatalog(catalogRequest).subscribe({
      next: (result: any) => {
        this.catalogId = result['@id'];
        const participantId = this.extractParticipantId(result);
        if (!participantId) {
          this.notificationService.showError('Participant ID not found in catalog');
          return;
        }
        this.participantId = participantId;
        const endpointUrl = this.extractEndpointUrl(result);
        if (!endpointUrl) {
          this.notificationService.showError('EndpointUrl not found in catalog');
          return;
        }
        this.endpointUrl = endpointUrl;
        this.matchedDataset = this.findMatchingDataset(result, this.data.assetId);
        if (this.matchedDataset) {
          this.extractDatasetProperties(this.matchedDataset);
        }
      },
      error: (err) => {
        console.error('❌ Failed to fetch catalog:', err);
      }
    });
  }

  private extractParticipantId(result: any): string | null {
    const participantArray = result?.['https://w3id.org/edc/v0.0.1/ns/participantId'];
    const value = participantArray?.[0]?.['@value'];

    return value ?? null;
  }

  private extractEndpointUrl(result: any): string | null {
    const participantArray = result?.['https://www.w3.org/ns/dcat/service'];
    const endpointUrl = participantArray?.[0]?.['https://purl.org/dc/terms/endpointUrl'];
    const value = endpointUrl?.[0]?.['@value'];
    return value ?? null;
  }

  private findMatchingDataset(result: any, assetId: string): any | null {
    const datasets = result?.['https://www.w3.org/ns/dcat/dataset'];

    if (!Array.isArray(datasets)) {
      return null;
    }

    return datasets.find((dataset: any) => dataset['@id'] === assetId) ?? null;
  }

  private extractDatasetProperties(dataset: any): void {
    const getValue = (obj: any, key: string): string | undefined => {
      const valueArr = obj?.[key];
      if (Array.isArray(valueArr) && valueArr.length > 0) {
        return valueArr[0]['@value'];
      }
      return undefined;
    };

    this.title = getValue(dataset, 'https://purl.org/dc/terms/title');
    this.description = getValue(dataset, 'https://purl.org/dc/terms/description');
    const rawOntology = getValue(dataset, 'https://ontologia.segittur.es/turismo/def/core/concept');
    this.ontologyType = rawOntology?.split(':')[1] ?? rawOntology;
    this.datasetId = dataset['@id'];
  }

  startNegotiation(): void {
    if (!this.matchedDataset || !this.participantId) {
      this.notificationService.showError("Missing dataset or participant ID.");
      return;
    }

    const offer = this.matchedDataset["http://www.w3.org/ns/odrl/2/hasPolicy"]
    const assetId = this.matchedDataset["@id"];

    if (!offer || !assetId) {
      this.notificationService.showError("Missing offer or asset ID.");
      return;
    }

    const initiateRequest = {
      "@context": {
        odrl: "http://www.w3.org/ns/odrl/2/"
      },
      "@type": "NegotiationInitiateRequestDto",
      connectorAddress: this.endpointUrl,
      protocol: "dataspace-protocol-http",
      connectorId: this.participantId,
      providerId: this.participantId,
      offer: {
        offerId: offer[0]['@id'],
        assetId: assetId,
        policy: offer[0],
      },
    };

    this.contractNegotiationService.initiateContractNegotiation(initiateRequest).subscribe({
      next: response => {
        this.notificationService.showInfo("Negotiation started successfully.");
        this.dialogRef.close({ refreshList: true });
      },
      error: err => {
        console.error("❌ Negotiation initiation failed:", err);
        this.notificationService.showError("Failed to initiate negotiation.");
      }
    });
  }
  
  close(): void {
    this.dialogRef.close();
  }

}
