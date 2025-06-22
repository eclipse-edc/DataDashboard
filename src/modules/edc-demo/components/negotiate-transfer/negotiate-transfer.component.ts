import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CatalogService} from "../../../mgmt-api-client/api/catalog.service";
import {Catalog, CatalogRequest, Dataset, DatasetRequest} from "@think-it-labs/edc-connector-client";
import {NotificationService} from "../../services/notification.service";
import {ContractNegotiationService} from "../../../mgmt-api-client";

@Component({
  selector: 'app-negotiate-transfer',
  templateUrl: './negotiate-transfer.component.html',
  styleUrls: ['./negotiate-transfer.component.scss']
})
export class NegotiateTransferComponent implements OnInit {

  asset = {
    id: "testAsset",
    name: "testAsset",
    description: "testAssetDescription",
    keywords: "testkeyword1, testkeyword2",
    ontologyType: "segittur:ontTourismService",
    qualityNote: "testQualityNote",
    mediaType: "application/json",
    language: "en",
    dataAddress: {
      method: "GET",
      type: "HttpData",
      baseUrl: "https://test.url"
    }
  };

  constructor(
    private dialogRef: MatDialogRef<NegotiateTransferComponent>,
    private catalogService: CatalogService,
    private contractNegotiationService: ContractNegotiationService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: { counterParty: string; assetId: string },
  ) {}

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  ngOnInit(): void {
    const datasetRequest: DatasetRequest = {
      "@id": this.data.assetId,
      counterPartyAddress: this.data.counterParty,
      querySpec: {
        offset: 0,
        limit: 2147483647,
        filterExpression: []
      }
    };

    // this.catalogService.requestDataset(datasetRequest).subscribe({
    //   next: (dataset: Dataset) => {
    //     this.asset = {
    //       id: dataset.id,
    //       title: dataset.optionalValue('dcterms', 'title') ?? '-',
    //       description: dataset.optionalValue('dcterms', 'description') ?? '-',
    //       ontology: dataset.optionalValue('segitturont', 'concept') ?? '-',
    //       organization: dataset.optionalValue('edc', 'originatorOrganization') ?? '-'
    //     };
    //   },
    //   error: err => {
    //     console.error('Failed to load dataset:', err);
    //   }
    // });
  }


  close(): void {
    this.dialogRef.close();
  }

  startNegotiation(): void {
    // const initiateRequest: any = {
    //   "@context": {
    //     odrl: "http://www.w3.org/ns/odrl/2/"
    //   },
    //   "@type": "NegotiationInitiateRequestDto",
    //   connectorAddress: contractOffer.endpointUrl || '',
    //   protocol: "dataspace-protocol-http",
    //   connectorId: contractOffer.participantId || '',
    //   providerId: contractOffer.participantId || '',
    //   offer: {
    //     offerId: contractOffer.policy['@id'],
    //     assetId: contractOffer.id,
    //     policy: contractOffer.policy,
    //   },
    // };
    //this.contractNegotiationService.initiateContractNegotiation(initiateRequest).subscribe();
  }
}
