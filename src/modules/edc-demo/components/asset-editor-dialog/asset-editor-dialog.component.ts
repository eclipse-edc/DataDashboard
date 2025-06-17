import { Component, Inject, OnInit } from '@angular/core';
import { AssetInput } from '@think-it-labs/edc-connector-client';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageType } from '../../models/storage-type';

@Component({
  selector: 'edc-demo-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog implements OnInit {

  // General Information
  assetMetadata = {
    name: '',
    id: '',
    description: '',
    ontologyType: 'Organization'
  };

  // Datasource Information
  selectedStorageType: string = 'rest';
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
  // AZURE
  azureConfig = {
    account: '',
    keyName: '',
    container: '',
    blobName: ''
  }


  // Authentication
  selectedAuthType: 'vault' | 'value' = 'vault';

  ontologyType: string = 'Organization';

  // Headers & Payload
  additionalHeaders: { name: string; value: string }[] = [];
  customPayload: { contentType: string; body: string } | null = null;
  // UI Sections
  section = {
    general: true,
    datasource: false
  };

  constructor(
    private dialogRef: MatDialogRef<AssetEditorDialog>,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[]
  ) {}

  ngOnInit(): void {}

  // Getters
  get hasPayload(): boolean {
    return !!this.customPayload;
  }

  isGeneralValid(): boolean {
    return !!this.assetMetadata.name?.trim() && !!this.assetMetadata.id?.trim();
  }

  isDatasourceValid(): boolean {
    switch (this.selectedStorageType) {
      case 'rest':
        return !!this.restConfig.method?.trim() && !!this.restConfig.url?.trim();

      case 'amazonS3':
        return !!this.s3Config.region?.trim() &&
          !!this.s3Config.bucket?.trim() &&
          !!this.s3Config.keyName?.trim() &&
          !!this.s3Config.accessKey?.trim() &&
          !!this.s3Config.secretKey?.trim();

      case 'azure':
        return !!this.azureConfig.account?.trim() &&
          !!this.azureConfig.keyName?.trim() &&
          !!this.azureConfig.container?.trim() &&
          !!this.azureConfig.blobName?.trim();

      default:
        return false;
    }
  }

  // Toggle Methods
  toggleAuth(): void {
    this.restConfig.auth.visible = !this.restConfig.auth.visible;
  }

  togglePayload(): void {
    this.restConfig.payload = this.restConfig.payload ? null : { contentType: '', body: '' };
  }

  addHeader(): void {
    this.restConfig.additionalHeaders.push({ name: '', value: '' });
  }

  removeHeader(index: number): void {
    this.restConfig.additionalHeaders.splice(index, 1);
  }


  isFormValid(): boolean {
    if (!this.isGeneralValid()) return false;
    if (!this.isDatasourceValid()) return false;

    return this.selectedStorageType === 'rest' && this.isRestValid()
      || this.selectedStorageType === 'amazonS3' && this.isS3Valid()
      || this.selectedStorageType === 'azure' && this.isAzureValid();
  }

  isRestValid(): boolean {
    return !!this.restConfig.method && !!this.restConfig.url;
  }

  isS3Valid(): boolean {
    return !!this.s3Config.region && !!this.s3Config.bucket && !!this.s3Config.keyName && !!this.s3Config.accessKey && !!this.s3Config.secretKey;
  }

  isAzureValid(): boolean {
    return !!this.azureConfig.account && !!this.azureConfig.keyName && !!this.azureConfig.container && !!this.azureConfig.blobName;
  }

  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  // TODO
  //  -_ in the name is possible, also whitespaces, but whitespaces should be whenever theres a space, replace in ID with -
  // Description is required
  //
  //
  // Region is text input

  clearDatasourceFields(): void {
    // Clear all types
    this.restConfig.method = '';
    this.restConfig.url = '';

    this.s3Config.region = '';
    this.s3Config.bucket = '';
    this.s3Config.keyName = '';
    this.s3Config.accessKey = '';
    this.s3Config.secretKey = '';

    this.azureConfig.account = '';
    this.azureConfig.keyName = '';
    this.azureConfig.container = '';
    this.azureConfig.blobName = '';
  }

  onSave(): void {
    let dataAddress: any = { type: this.selectedStorageType };

    if (this.selectedStorageType === 'rest') {
      dataAddress = {
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
        headers: this.restConfig.additionalHeaders.length ? this.restConfig.additionalHeaders : undefined,
        payload: this.restConfig.payload || undefined
      };
    }

    if (this.selectedStorageType === 'amazonS3') {
      dataAddress = {
        type: 'AmazonS3',
        region: this.s3Config.region,
        bucketName: this.s3Config.bucket,
        keyName: this.s3Config.keyName,
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey
      };
    }

    if (this.selectedStorageType === 'azure') {
      dataAddress = {
        type: 'AzureStorage',
        account: this.azureConfig.account,
        container: this.azureConfig.container,
        blobname: this.azureConfig.blobName,
        keyName: this.azureConfig.keyName
      };
    }

    const assetInput: AssetInput = {
      "@id": this.id,
      properties: {
        name: this.name,
        description: this.description,
        publisher: this.publisher,
        ontologyType: this.ontologyType
      },
      dataAddress
    };

    this.dialogRef.close({ assetInput });
  }

}

