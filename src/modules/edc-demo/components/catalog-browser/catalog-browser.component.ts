import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { first, map, startWith, switchMap, take } from 'rxjs/operators';
import { ContractNegotiationStates } from '../../models/api/contract-negotiation-states';
import { ContractOffer } from '../../models/api/contract-offer';
import { NegotiationCreation } from '../../models/api/negotiation-creation';
import { NegotiationResult } from '../../models/api/negotiation-result';
import { TransferProcess } from '../../models/api/transfer-process';
import { TransferProcessCreation } from '../../models/api/transfer-process-creation';
import { TransferProcessStates } from '../../models/api/transfer-process-states';
import { Asset } from '../../models/asset';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';
import { CatalogBrowserTransferDialog } from '../catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component';

@Component({
  selector: 'edc-demo-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  private fetch$ = new BehaviorSubject(null);

  filteredContractOffers$: Observable<ContractOffer[]> = of([]);
  searchText = '';
  runningTransferProcesses: TransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>(); // contractOfferId, NegotiationResult
  finishedNegotiations: Map<string, string> = new Map<string, string>(); // contractOfferId, contractAgreementId
  busyAssetIds: string[] = [];
  private pollingHandleTransfer?: any;
  private pollingHandleNegotiation?: any;
  
  constructor(private apiService: EdcDemoApiService, public dialog: MatDialog) { }

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

  onTransfer(contractOffer: ContractOffer) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog);

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      const storageTypeId: string = result.storageTypeId;
      if (!!storageTypeId) {
        this.startTransfer(contractOffer, storageTypeId);
      }
    });
  }

  startTransfer(contractOffer: ContractOffer, storageTypeId: string) {

    const contractAgreementId = this.finishedNegotiations.get(contractOffer.id)!;

    const transferProcessCreation: TransferProcessCreation = {
      assetId: contractOffer.asset.id,
      contractId: contractAgreementId,
      dataDestinationType: storageTypeId,
      connectorAddress: contractOffer.asset.originator
    };

    const finishedTransferProcessStates = [
      TransferProcessStates.COMPLETED as number, 
      TransferProcessStates.ERROR as number,
      TransferProcessStates.ENDED as number];

    this.apiService.createTransferProcess(transferProcessCreation).subscribe(transferProcess => { 
      this.runningTransferProcesses.push(transferProcess);
      if (!this.pollingHandleTransfer) {
        // there are no active transfer processes
        this.pollingHandleTransfer = setInterval(() => {
          const finishedTransferProcesses: TransferProcess[] = [];
          for (const transferProcess of this.runningTransferProcesses) {
            this.apiService.getTransferProcessesById(transferProcess.id).subscribe(refreshedTransferProcess => {
              
              Object.assign(transferProcess, refreshedTransferProcess);
              if (finishedTransferProcessStates.includes(transferProcess.state)) {
                  finishedTransferProcesses.push(transferProcess);
              }

              this.runningTransferProcesses = this.runningTransferProcesses.filter(tp => !finishedTransferProcesses.includes(tp));          
              if (this.runningTransferProcesses.length === 0) {
                clearInterval(this.pollingHandleTransfer);
                this.pollingHandleTransfer = undefined;
              }
            });
          }
        }, 1000);
      }
    });
  }

  startNegotiation(contractOffer: ContractOffer) {

    const negotiationCreation: NegotiationCreation = {
      connectorAddress: contractOffer.asset.originator,
      offerId: contractOffer.id
    };

    const finishedNegotiationStates = [
      ContractNegotiationStates.CONFIRMED as number,
      ContractNegotiationStates.DECLINED as number,
      ContractNegotiationStates.ERROR as number];

    this.apiService.createNegotiation(negotiationCreation).subscribe(negotiationResult => { 
      this.finishedNegotiations.delete(negotiationCreation.offerId);
      this.runningNegotiations.set(negotiationCreation.offerId, negotiationResult);

      if (!this.pollingHandleNegotiation) {
        // there are no active negotiations
        this.pollingHandleNegotiation = setInterval(() => {
          // const finishedNegotiations: NegotiationResult[] = [];
          for (const negotiation of this.runningNegotiations.values()) {
            this.apiService.getNegotiationState(negotiation.id).subscribe(negotiationState => {
              if (finishedNegotiationStates.includes(negotiationState.state)) {
                this.runningNegotiations.delete(negotiation.offerId);
                if (negotiationState.state === ContractNegotiationStates.CONFIRMED) {
                  this.finishedNegotiations.set(negotiation.offerId, negotiationState.contractAgreement.id);
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
  
  onNegotiate(contractOffer: ContractOffer) {
    this.startNegotiation(contractOffer);
  }

  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiations.get(contractOffer.id) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.asset.id);
  }

  getState(contractOffer: ContractOffer) {
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

  isNegoiated(contractOffer: ContractOffer) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }
}
