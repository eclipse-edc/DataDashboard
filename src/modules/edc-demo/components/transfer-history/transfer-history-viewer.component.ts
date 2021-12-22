import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TransferProcess } from '../../models/api/transfer-process';
import { TransferProcessStates } from '../../models/api/transfer-process-states';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';

@Component({
  selector: 'edc-demo-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['stateTimestamp', 'id', 'type', 'state', 'connectorId', 'connectorAddress', 'protocol', 'assetId', 'contractId', 'dataDestinationType', 'error' ];
  transferProcesses$: Observable<TransferProcess[]> = of([]);
  transferProcessStates = TransferProcessStates;

  constructor(private apiService: EdcDemoApiService) { }

  ngOnInit(): void {
    this.transferProcesses$ = this.apiService.getTransferProcesses();
  }
}
