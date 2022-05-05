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

  columns: string[] = ['id', 'type', 'state', 'connectorId', 'protocol', 'assetId', 'contractId', 'error', 'action'];
  transferProcesses$: Observable<TransferProcessDto[]> = of([]);
  storageExplorerLinkTemplate: string | undefined;

  constructor(private apiService: TransferProcessService, private appConfigService: AppConfigService) { }

  ngOnInit(): void {
    this.transferProcesses$ = this.apiService.getAllTransferProcesses();
    this.storageExplorerLinkTemplate = this.appConfigService.getConfig()?.storageExplorerLinkTemplate
  }
}
