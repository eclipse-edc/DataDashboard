import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, mergeMap, switchMap} from 'rxjs/operators';
import {ContractOffer} from '../../models/api/contract-offer';
import {NegotiationResult} from '../../models/api/negotiation-result';
import {TransferProcessStates} from '../../models/api/transfer-process-states';
import {
  CatalogBrowserTransferDialog
} from '../catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component';
import {CatalogBrowserService} from "../../services/catalog-browser.service";
import {ContractNegotiationDto, NegotiationInitiateRequestDto, TransferRequestDto} from "../../../edc-dmgmt-client";
import {NotificationService} from "../../services/notification.service";
import {Router} from "@angular/router";

interface RunningTransferProcess {
  processId: string;
  assetId?: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'edc-demo-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  filteredContractOffers$: Observable<ContractOffer[]> = of([]);
  searchText = '';
  runningTransferProcesses: RunningTransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>(); // contractOfferId, NegotiationResult
  finishedNegotiations: Map<string, ContractNegotiationDto> = new Map<string, ContractNegotiationDto>(); // contractOfferId, contractAgreementId
  busyAssetIds: string[] = [];
  private fetch$ = new BehaviorSubject(null);
  private pollingHandleTransfer?: any;
  private pollingHandleNegotiation?: any;
  private readonly finishedTransferProcessStates = [
    "COMPLETED",
    "ERROR",
    "ENDED"];

  constructor(private apiService: CatalogBrowserService,
              public dialog: MatDialog,
              private router: Router,
              private notificationService: NotificationService,
              @Inject('HOME_CONNECTOR_STORAGE_ACCOUNT') private homeConnectorStorageAccount: string) {
  }

  ngOnInit(): void {
    this.filteredContractOffers$ = this.fetch$
      .pipe(
        switchMap(() => {
          const contractOffers$ = this.apiService.getContractOffers();
          return !!this.searchText ?
            contractOffers$.pipe(map(contractOffers => contractOffers.filter(contractOffer => contractOffer.asset.name.toLowerCase().includes(this.searchText))))
            :
            contractOffers$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onTransferClicked(contractOffer: ContractOffer) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog);

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      const storageTypeId: string = result.storageTypeId;
      if (!!storageTypeId) {
        this.startTransfer(contractOffer, storageTypeId);
      }
    });
  }

  startTransfer(contractOffer: ContractOffer, storageTypeId: string) {

    // const contractAgreementId = this.finishedNegotiations.get(contractOffer.id)!;
    var negotiation = this.finishedNegotiations.get(contractOffer.id);
    const transferRequest$ = this.apiService.getAgreementForNegotiation(<string>negotiation!.id).pipe(map(agreement => {
      const transferRequest: TransferRequestDto = {
        assetId: contractOffer.asset.id,
        contractId: agreement.id,
        connectorId: "consumer", //doesn't matter, but cannot be null
        dataDestination: {
          properties: {
            "type": storageTypeId,
            account: this.homeConnectorStorageAccount, // CAUTION: hardcoded value for AzureBlob
            container: "dst-container", // CAUTION: hardcoded value for AzureBlob
          }
        },
        transferType: {isFinite: true}, //must be there, otherwise NPE on backend
        connectorAddress: contractOffer.asset.originator
      };
      return transferRequest;
    }));


    const assetId = contractOffer.asset.id;
    transferRequest$.pipe(mergeMap(transferRequest => this.apiService.initiateTransfer(transferRequest)))
      .subscribe(transferProcessId => {

        this.startPolling(transferProcessId, assetId);
      });
  }

  private startPolling(transferProcessId: string, assetId: string) {

    // track this transfer process
    this.runningTransferProcesses.push({
      processId: transferProcessId,
      assetId: assetId,
      state: TransferProcessStates.REQUESTED
    });

    if (!this.pollingHandleTransfer) {
      this.pollingHandleTransfer = setInterval(this.pollRunningTransfers(), 1000);
    }
  }

  private pollRunningTransfers() {
    return () => {
      const finishedTransferProcesses: string[] = [];
      for (const runningId of this.runningTransferProcesses) {

        const processId = runningId.processId;
        this.apiService.getTransferProcessesById(processId).subscribe(refreshedTransferProcess => {

          if (this.finishedTransferProcessStates.includes(refreshedTransferProcess.state.toString())) {
            finishedTransferProcesses.push(processId);
            this.notificationService.showMessage(`Asset ${refreshedTransferProcess.dataRequest.assetId} has finished!`, 'Show me!', () => {
              this.router.navigate(['/transfer-history-viewer'])
            })
          }

          this.runningTransferProcesses = this.runningTransferProcesses.filter(tp => !finishedTransferProcesses.includes(tp.processId));
          if (this.runningTransferProcesses.length === 0) {
            clearInterval(this.pollingHandleTransfer);
            this.pollingHandleTransfer = undefined;
          }
        });
      }
    };
  }

  onNegotiateClicked(contractOffer: ContractOffer) {
    this.notificationService.showMessage("Negotiation started");
    const initiateRequest: NegotiationInitiateRequestDto = {
      connectorAddress: contractOffer.asset.originator,

      offer: {
        offerId: contractOffer.id,
        assetId: contractOffer.asset.id,
        policy: contractOffer.policy,
      },
      connectorId: 'yomama'
    };

    const finishedNegotiationStates = [
      "CONFIRMED",
      "DECLINED",
      "ERROR"];

    this.apiService.initiateNegotiation(initiateRequest).subscribe(negotiationId => {
      this.finishedNegotiations.delete(initiateRequest.offer.offerId);
      this.runningNegotiations.set(initiateRequest.offer.offerId, {
        id: negotiationId,
        offerId: initiateRequest.offer.offerId
      });

      if (!this.pollingHandleNegotiation) {
        // there are no active negotiations
        this.pollingHandleNegotiation = setInterval(() => {
          // const finishedNegotiations: NegotiationResult[] = [];

          for (const negotiation of this.runningNegotiations.values()) {
            this.apiService.getNegotiationState(negotiation.id).subscribe(updatedNegotiation => {
              if (finishedNegotiationStates.includes(updatedNegotiation.state)) {
                let offerId = negotiation.offerId;
                this.runningNegotiations.delete(offerId);
                if (updatedNegotiation.state === "CONFIRMED") {
                  this.finishedNegotiations.set(offerId, updatedNegotiation);
                }
              }

              if (this.runningNegotiations.size === 0) {
                clearInterval(this.pollingHandleNegotiation);
                this.pollingHandleNegotiation = undefined;
              }
            });
          }
        }, 1000);
      }
    });
  }

  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiations.get(contractOffer.id) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.asset.id);
  }

  getState(contractOffer: ContractOffer): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.asset.id);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer.id);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: ContractOffer) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }
}
