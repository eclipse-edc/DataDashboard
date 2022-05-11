import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TransferProcessDto, TransferProcessService} from "../../../edc-dmgmt-client";
import {AppConfigService} from "../../../app/app-config.service";

@Component({
  selector: 'edc-demo-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['id', 'state', 'connectorId', 'assetId', 'contractId', 'action'];
  transferProcesses$: Observable<TransferProcessDto[]> = of([]);
  storageExplorerLinkTemplate: string | undefined;

  constructor(private transferProcessService: TransferProcessService, private appConfigService: AppConfigService) { }

  ngOnInit(): void {
    this.loadTransferProcesses();
    this.storageExplorerLinkTemplate = this.appConfigService.getConfig()?.storageExplorerLinkTemplate
  }

  onDeprovision(transferProcess: TransferProcessDto): void {
    this.transferProcessService.deprovisionTransferProcess(transferProcess.id).subscribe(() => this.loadTransferProcesses());
  }

  showStorageExplorerLink(transferProcess: TransferProcessDto) {
    return transferProcess.dataDestination?.properties?.type === 'AzureStorage' && transferProcess.state === 'COMPLETED';
  }

  showDeprovisionButton(transferProcess: TransferProcessDto) {
    return ['COMPLETED', 'PROVISIONED', 'REQUESTED', 'REQUESTED_ACK', 'IN_PROGRESS', 'STREAMING'].includes(transferProcess.state);
  }

  private loadTransferProcesses() {
    this.transferProcesses$ = this.transferProcessService.getAllTransferProcesses();
  }
}
