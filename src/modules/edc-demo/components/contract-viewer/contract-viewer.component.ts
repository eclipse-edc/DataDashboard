import {Component, Inject, OnInit} from '@angular/core';
import {
  AssetService,
  ContractAgreementService,
  ContractNegotiationService,
  TransferProcessService
} from "../../../mgmt-api-client";
import {from, Observable, of} from "rxjs";
import {ContractAgreement, IdResponse} from "../../../mgmt-api-client/model";
import {ContractOffer} from "../../models/contract-offer";
import {catchError, filter, first, map, switchMap, tap} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";
import {
  CatalogBrowserTransferDialog
} from "../catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CatalogBrowserService} from "../../services/catalog-browser.service";
import {Router} from "@angular/router";
import {TransferProcessStates} from "../../models/transfer-process-states";
import {NegotiateTransferComponent} from "../negotiate-transfer/negotiate-transfer.component";
import {ContractNegotiation} from "@think-it-labs/edc-connector-client"
import {TransferRequest} from "./transferRequest";

interface RunningTransferProcess {
  processId: string;
  contractId: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'app-contract-viewer',
  templateUrl: './contract-viewer.component.html',
  styleUrls: ['./contract-viewer.component.scss']
})
export class ContractViewerComponent implements OnInit {

  contracts$: Observable<ContractAgreement[]> = of([]);
  private runningTransfers: RunningTransferProcess[] = [];
  private pollingHandleTransfer?: any;
  private contractNegotiationData?: ContractNegotiation[]

  constructor(private contractAgreementService: ContractAgreementService,
              private assetService: AssetService,
              public dialog: MatDialog,
              @Inject('HOME_CONNECTOR_STORAGE_ACCOUNT') private homeConnectorStorageAccount: string,
              private transferService: TransferProcessService,
              private catalogService: CatalogBrowserService,
              private router: Router,
              private notificationService: NotificationService,
              private contractNegotiationService : ContractNegotiationService) {
  }

  private static isFinishedState(state: string): boolean {
    return [
      "COMPLETED",
      "ERROR",
      "ENDED"].includes(state);
  }

  async getConnectorAddressData() {
    await this.contractNegotiationService.queryNegotiations()
      .forEach((response: ContractNegotiation[]) => {
        this.contractNegotiationData = response.filter((item) => {
          return item['https://w3id.org/edc/v0.0.1/ns/state'][0]['@value'] === 'FINALIZED'
        })
      })
  }

  async ngOnInit(): Promise<void> {
    await this.getConnectorAddressData();
    this.refreshContracts();

    this.router.routerState.root.queryParams
      .pipe(first())
      .subscribe(params => {
        const providerUrl = params['providerUrl'];
        const assetId = params['assetId'];

        if (providerUrl && assetId) {
          this.dialog.open(NegotiateTransferComponent, {
            data: { providerUrl, assetId }
          }).afterClosed().pipe(first()).subscribe(result => {
            if (result?.refreshList) {
              this.refreshContracts();
            }
          });
        }
      });
  }

  refreshContracts(): void {
    this.contractAgreementService.queryAllAgreements().pipe(
      map((allContracts: ContractAgreement[]) => {
        const negotiationData = this.contractNegotiationData || [];

        return allContracts.reduce((result: ContractAgreement[], contract) => {
          const matchingNegotiation = negotiationData.find(n =>
            n['https://w3id.org/edc/v0.0.1/ns/contractAgreementId']?.[0]?.['@value'] === contract['@id']
          );

          if (matchingNegotiation) {
            (contract as any)['connectorAddress'] =
              matchingNegotiation['https://w3id.org/edc/v0.0.1/ns/counterPartyAddress']?.[0]?.['@value'] || '';
            result.push(contract);
          }

          return result;
        }, []);
      }),
      catchError(err => {
        console.error('Failed fetching contracts:', err);
        return of([]);
      })
    ).subscribe(filteredContracts => {
      this.contracts$ = of(filteredContracts);
    });
  }


  asDate(epochSeconds?: number): string {
    if(epochSeconds){
      const d = new Date(0);
      d.setUTCSeconds(epochSeconds);
      return d.toLocaleDateString();
    }
    return '';
  }

  onTransferClicked(contract: ContractAgreement) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog);

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      const dataDestination: string = result.dataDestination;

      const request = this.createTransferRequest(contract, dataDestination);

      this.transferService.initiateTransfer(request).subscribe({
        next: (transferId) => {
          this.startPolling(transferId, contract['@id']!);
        },
        error: (error) => {
          console.error(error);
          this.notificationService.showError("Error initiating transfer");
        }
      });
    });
  }

  isTransferInProgress(contractId: string): boolean {
    return !!this.runningTransfers.find(rt => rt.contractId === contractId);
  }

  private createTransferRequest(contract: ContractAgreement, dataDestination: any): TransferRequest {
    return {
      '@context': {
        odrl: "http://www.w3.org/ns/odrl/2/"
      },
      assetId: contract.assetId,
      contractId: contract.id,
      dataDestination: dataDestination,
      connectorAddress: (contract as any).connectorAddress,
      connectorId: contract.providerId,
      managedResources: false,
      protocol: "dataspace-protocol-http",
      transferType: {
        contentType: "application/octet-stream",
        isFinite: true
      }
    };
  }

  private startPolling(transferProcessId: IdResponse, contractId: string) {
    // track this transfer process
    this.runningTransfers.push({
      processId: transferProcessId.id!,
      state: TransferProcessStates.REQUESTED,
      contractId: contractId
    });

    if (!this.pollingHandleTransfer) {
      this.pollingHandleTransfer = setInterval(this.pollRunningTransfers(), 1000);
    }

  }

  private pollRunningTransfers() {
    return () => {
      from(this.runningTransfers) //create from array
        .pipe(switchMap(runningTransferProcess => this.catalogService.getTransferProcessesById(runningTransferProcess.processId)), // fetch from API
          filter(transferprocess => ContractViewerComponent.isFinishedState(transferprocess.state!)), // only use finished ones
          tap(transferProcess => {
            // remove from in-progress
            this.runningTransfers = this.runningTransfers.filter(rtp => rtp.processId !== transferProcess.id)
            this.notificationService.showInfo(`Transfer [${transferProcess.id}] complete!`, "Show me!", () => {
              this.router.navigate(['/transfer-history'])
            })
          }),
        ).subscribe(() => {
        // clear interval if necessary
        if (this.runningTransfers.length === 0) {
          clearInterval(this.pollingHandleTransfer);
          this.pollingHandleTransfer = undefined;
        }
      }, error => this.notificationService.showError(error))
    }

  }
}
