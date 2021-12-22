import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { first, map, startWith, switchMap, take } from 'rxjs/operators';
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

  filteredAssets$: Observable<Asset[]> = of([]);
  searchText = '';
  isTransfering = false;
  negotiatedAssetIds: string[] = [];
  transferProcesses: TransferProcess[] = [];
  busyAssetIds: string[] = [];
  private pollingHandle?: any;
  
  constructor(private apiService: EdcDemoApiService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.filteredAssets$ = this.fetch$
      .pipe(
        switchMap(() => {
          const assets$ = this.apiService.getAssets();
          return !!this.searchText ?
            assets$.pipe(map(assets => assets.filter(asset => asset.name.toLowerCase().includes(this.searchText))))
            :
            assets$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onTransfer(asset: Asset) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog);

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      const storageTypeId: string = result.storageTypeId;
      if (!!storageTypeId) {
        this.startTransfer(asset, storageTypeId);
      }
    });
  }

  startTransfer(asset: Asset, storageTypeId: string) {

    const transferProcessCreation: TransferProcessCreation = {
      assetId: asset.id,
      contractId: '1', // fake contract id
      dataDestinationType: storageTypeId,
      connectorAddress: asset.originator
    };

    const finishedTransferProcessStates = [
      TransferProcessStates.COMPLETED as number, 
      TransferProcessStates.ERROR as number,
      TransferProcessStates.ENDED as number];

    this.apiService.createTransferProcess(transferProcessCreation).subscribe(transferProcess => { 
      this.transferProcesses.push(transferProcess);
      if (!this.pollingHandle) {
        // there a no active transfer processes
        this.pollingHandle = setInterval(() => {
          const finishedTransferProcesses: TransferProcess[] = [];
          for (let transferProcess of this.transferProcesses) {
            this.apiService.getTransferProcessesById(transferProcess.id).subscribe(refreshedTransferProcess => {
              
              Object.assign(transferProcess, refreshedTransferProcess);
              if (finishedTransferProcessStates.includes(transferProcess.state)) {
                  finishedTransferProcesses.push(transferProcess);
              }

              this.transferProcesses = this.transferProcesses.filter(tp => !finishedTransferProcesses.includes(tp));          
              if (this.transferProcesses.length === 0) {
                clearInterval(this.pollingHandle);
              }
            });
          }
        }, 1000);
      }
    });
  }

  private pollTransferProcessStates() {
    this.apiService.getTransferProcesses()
  }

  onNegotiate(asset: Asset) {
    // negotiation is just simulated
    this.negotiatedAssetIds.push(asset.id);
    this.fakeBusy(asset);
  }

  isBusy(asset: Asset) {
    return this.busyAssetIds.includes(asset.id) || !!this.transferProcesses.find(tp => tp.assetId === asset.id);
  }

  getTransferState(asset: Asset) {
    const transferProcess = this.transferProcesses.find(tp => tp.assetId === asset.id);
    return transferProcess ? TransferProcessStates[transferProcess.state] : '';
  }

  isNegoiated(asset: Asset) {
    return this.negotiatedAssetIds.includes(asset.id);
  }

  fakeBusy(asset: Asset) {
    this.busyAssetIds.push(asset.id);
    setTimeout(() => this.busyAssetIds.splice(this.busyAssetIds.indexOf(asset.id), 1), 2000);
  }

  fakeBusyTransfer(asset: Asset) {
    this.busyAssetIds.push(asset.id);
    setTimeout(() => this.busyAssetIds.splice(this.busyAssetIds.indexOf(asset.id), 1), 6000);
  }
}
