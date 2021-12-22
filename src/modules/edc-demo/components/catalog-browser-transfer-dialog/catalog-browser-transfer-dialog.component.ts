import { Component, Inject, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Asset } from '../../models/asset';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractDefinition } from '../../models/api/contract-definition';
import { Criterion } from '../../models/api/criterion';
import { StorageType } from '../../models/api/storage-type';
import { TransferProcessCreation } from '../../models/api/transfer-process-creation';


@Component({
  selector: 'edc-demo-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog implements OnInit {

  storageTypes$: Observable<StorageType[]> = of([]); 
  name: string = '';
  storageTypeId = '';

  constructor(private apiService: EdcDemoApiService, 
    private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
    @Inject(MAT_DIALOG_DATA) contractDefinition?: any) { 
    }

  ngOnInit(): void {
    this.storageTypes$ = this.apiService.getStorageTypes();
  }


  onTransfer() {
    this.dialogRef.close({ storageTypeId: this.storageTypeId });
  }

}
