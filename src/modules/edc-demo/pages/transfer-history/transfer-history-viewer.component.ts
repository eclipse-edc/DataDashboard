import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TransferProcessDto, TransferProcessService} from "../../../edc-dmgmt-client";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../components/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'edc-demo-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['id', 'creationDate', 'state', 'lastUpdated', 'connectorId', 'assetId', 'contractId', 'action'];
  transferProcesses$: Observable<TransferProcessDto[]> = of([]);

  constructor(private transferProcessService: TransferProcessService,
              private dialog : MatDialog,
              public titleService: Title) {
  }

  ngOnInit(): void {
    this.loadTransferProcesses();
  }

  onDeprovision(transferProcess: TransferProcessDto): void {

    const dialogData = new ConfirmDialogModel("Confirm deprovision", `Deprovisioning resources for transfer [${transferProcess.id}] will take some time and once started, it cannot be stopped.`)
    dialogData.confirmColor = "warn";
    dialogData.confirmText = "Confirm";
    dialogData.cancelText = "Abort";
    const ref = this.dialog.open(ConfirmationDialogComponent, {maxWidth: '20%', data: dialogData});

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.transferProcessService.deprovisionTransferProcess(transferProcess.id).subscribe(() => this.loadTransferProcesses());
      }
    });
  }

  showStorageExplorerLink(transferProcess: TransferProcessDto) {
    return transferProcess.dataDestination?.properties?.type === 'AzureStorage' && transferProcess.state === 'COMPLETED';
  }

  showDeprovisionButton(transferProcess: TransferProcessDto) {
    return ['COMPLETED', 'PROVISIONED', 'REQUESTED', 'REQUESTED_ACK', 'IN_PROGRESS', 'STREAMING'].includes(transferProcess.state);
  }

  loadTransferProcesses() {
    this.transferProcesses$ = this.transferProcessService.getAllTransferProcesses();
  }

  asDate(epochMillis?: number) {
    return epochMillis ? new Date(epochMillis).toLocaleDateString() : '';
  }
}
