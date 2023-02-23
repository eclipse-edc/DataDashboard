import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StorageType} from '../../models/storage-type';


@Component({
  selector: 'edc-demo-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog implements OnInit {

  name: string = '';
  storageTypeId: string = 'AzureStorage';

  // Azure Account or AWS Region (dependent on selected storage type)
  param1: string = '';
  
  // Azure Container or AWS S3 Bucket (dependent on selected storage type)
  param2: string = '';

  constructor(@Inject('STORAGE_TYPES') public storageTypes: StorageType[],
              @Inject('AWS_REGIONS') public awsRegions: string[],
              private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: any) {
  }

  ngOnInit(): void {
  }


  onTransfer() {
    this.dialogRef.close({storageTypeId: this.storageTypeId, param1 : this.param1, param2 : this.param2});
  }

}
