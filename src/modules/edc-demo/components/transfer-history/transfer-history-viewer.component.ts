import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TransferProcessService } from '../../../mgmt-api-client';
import { TransferProcess } from '../../../mgmt-api-client/model';
import { AppConfigService } from '../../../app/app-config.service';
import {
  ConfirmationDialogComponent,
  ConfirmDialogModel
} from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'edc-demo-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['id', 'state', 'lastUpdated', 'connectorId', 'assetId', 'contractId'];
  storageExplorerLinkTemplate: string | undefined;

  // Pagination state
  pageSizeOptions = [5, 10, 20];
  pageSize = 10;
  pageIndex = 0;

  // Data source
  allTransfers: TransferProcess[] = [];
  displayedTransfers: TransferProcess[] = [];
  totalTransfers = 0;

  constructor(
    private transferProcessService: TransferProcessService,
    private dialog: MatDialog,
    private appConfigService: AppConfigService
  ) {}

  ngOnInit(): void {
    this.loadTransferProcesses();
    this.storageExplorerLinkTemplate = this.appConfigService.getConfig()?.storageExplorerLinkTemplate;
  }

  loadTransferProcesses(): void {
    this.transferProcessService.queryAllTransferProcesses().subscribe(transfers => {
      this.allTransfers = transfers;
      this.totalTransfers = transfers.length;
      this.pageIndex = 0; // Reset to first page on new load
      this.updateDisplayedTransfers();
    });
  }

  updateDisplayedTransfers(): void {
    const start = this.pageIndex * this.pageSize;
    const end = Math.min(start + this.pageSize, this.totalTransfers);
    this.displayedTransfers = this.allTransfers.slice(start, end);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = +select.value;
    this.pageIndex = 0;
    this.updateDisplayedTransfers();
  }

  nextPage(): void {
    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      this.updateDisplayedTransfers();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updateDisplayedTransfers();
    }
  }

  get pageStart(): number {
    return this.pageIndex * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalTransfers);
  }

  get pageCount(): number {
    return Math.ceil(this.totalTransfers / this.pageSize);
  }

  asDate(epochMillis?: number): string {
    return epochMillis ? new Date(epochMillis).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) : '';
  }

  showStorageExplorerLink(tp: TransferProcess): boolean {
    return tp.dataDestination?.properties?.type === 'AzureStorage' && tp.state === 'COMPLETED';
  }

  showDeprovisionButton(tp: TransferProcess): boolean {
    return ['COMPLETED', 'PROVISIONED', 'REQUESTED', 'REQUESTED_ACK', 'IN_PROGRESS', 'STREAMING'].includes(tp.state!);
  }

  onDeprovision(tp: TransferProcess): void {
    const dialogData = new ConfirmDialogModel(
      'Confirm deprovision',
      `Deprovisioning resources for transfer [${tp["@id"]}] will take some time and once started, it cannot be stopped.`
    );
    dialogData.confirmColor = 'warn';
    dialogData.confirmText = 'Confirm';
    dialogData.cancelText = 'Abort';

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      data: dialogData
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.transferProcessService.deprovisionTransferProcess(tp["@id"]!).subscribe(() => this.loadTransferProcesses());
      }
    });
  }
}
