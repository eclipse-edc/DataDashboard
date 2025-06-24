import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageType } from '../../models/storage-type';
import {DataAddress} from "@think-it-labs/edc-connector-client";
import { ContractAgreement } from "../../../mgmt-api-client/model";

@Component({
  selector: 'edc-demo-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog implements OnInit {

  selectedStorageType: string = 'rest'; // default to REST
  showPlaceholder = false;

  // REST-API Endpoint
  restConfig = {
    method: 'GET',
    url: '',
    auth: {
      type: 'vault' as 'vault' | 'value' | null,
      headerName: '',
      vaultSecretName: '',
      headerValue: '',
      visible: false,
    },
    additionalHeaders: [] as { name: string; value: string }[],
    payload: null as { contentType: string; body: string } | null,
  };

  // Amazon S3
  s3Config = {
    region: '',
    bucket: '',
    keyName: '',
    accessKey: '',
    secretKey: ''
  };

  // Azure Storage
  azureConfig = {
    account: '',
    sasToken: '',
    container: ''
  };

  constructor(
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  clearDatasourceFields(): void {
    // Reset REST fields
    this.restConfig.method = '';
    this.restConfig.url = '';
    this.restConfig.auth = {
      type: 'vault',
      headerName: '',
      vaultSecretName: '',
      headerValue: '',
      visible: false
    };
    this.restConfig.additionalHeaders = [];
    this.restConfig.payload = null;

    // Reset S3 fields
    this.s3Config = {
      region: '',
      bucket: '',
      keyName: '',
      accessKey: '',
      secretKey: ''
    };

    // Reset Azure fields
    this.azureConfig = {
      account: '',
      sasToken: '',
      container: ''
    };
  }

  toggleAuth(): void {
    this.restConfig.auth.visible = !this.restConfig.auth.visible;
  }

  togglePayload(): void {
    this.restConfig.payload = this.restConfig.payload
      ? null
      : { contentType: '', body: '' };
  }

  addHeader(): void {
    this.restConfig.additionalHeaders.push({ name: '', value: '' });
  }

  removeHeader(index: number): void {
    this.restConfig.additionalHeaders.splice(index, 1);
  }

  onTransfer(): void {
    let dataDestination: any = { type: this.selectedStorageType };

    if (this.selectedStorageType === 'rest') {
      dataDestination = {
        type: 'HttpData',
        method: this.restConfig.method,
        baseUrl: this.restConfig.url,
        authentication: this.restConfig.auth.visible
          ? {
            type: this.restConfig.auth.type,
            headerName: this.restConfig.auth.headerName,
            ...(this.restConfig.auth.type === 'vault'
              ? { vaultSecretName: this.restConfig.auth.vaultSecretName }
              : { headerValue: this.restConfig.auth.headerValue })
          }
          : undefined,
        headers: this.restConfig.additionalHeaders.length
          ? this.restConfig.additionalHeaders
          : undefined,
        payload: this.restConfig.payload || undefined
      };
    }

    if (this.selectedStorageType === 'amazonS3') {
      dataDestination = {
        type: 'AmazonS3',
        region: this.s3Config.region,
        bucketName: this.s3Config.bucket,
        keyName: this.s3Config.keyName,
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey
      };
    }

    if (this.selectedStorageType === 'azure') {
      dataDestination = {
        type: 'AzureStorage',
        account: this.azureConfig.account,
        container: this.azureConfig.container,
        keyName: this.azureConfig.sasToken
      };
    }

    // Close dialog and return selected configuration
    this.dialogRef.close({ dataDestination });
  }
}
