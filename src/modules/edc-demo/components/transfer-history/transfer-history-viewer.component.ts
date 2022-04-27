import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {TransferProcessDto, TransferProcessService} from "../../../edc-dmgmt-client";

@Component({
  selector: 'edc-demo-transfer-history',
  templateUrl: './transfer-history-viewer.component.html',
  styleUrls: ['./transfer-history-viewer.component.scss']
})
export class TransferHistoryViewerComponent implements OnInit {

  columns: string[] = ['stateTimestamp', 'id', 'type', 'state', 'connectorId', 'protocol', 'assetId', 'contractId', 'error'];
  transferProcesses$: Observable<TransferProcessDto[]> = of([]);

  constructor(private apiService: TransferProcessService) { }

  ngOnInit(): void {
    this.transferProcesses$ = this.apiService.getAllTransferProcesses();
  }
}
