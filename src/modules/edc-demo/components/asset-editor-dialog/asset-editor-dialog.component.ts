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
  // Basic Fields
  private _assetName = '';
  assetId = '';
  assetDescription = '';
  assetOntologyType: string = 'Organization';
  selectedStorageType: string = 'rest';

  get assetName(): string {
    return this._assetName;
  }

  set assetName(value: string) {
    this._assetName = value;
    this.assetId = value;
  }

  // Storage
  storageTypeId = 'AzureStorage';
  account = '';
  container = 'src-container';
  blobname = '';

  //REST:
  restMethod: string = 'GET';
  restUrl: string = '';
  //S3:
  s3Region = '';
  s3Bucket = '';
  s3KeyName = '';
  s3AccessKey = '';
  s3SecretKey = '';
  //AZURE
  azureAccount = '';
  azureKeyName = '';
  azureContainer = '';
  azureBlobName = '';

  // Visibility Toggles
  authVisible = false;
  headersVisible = false;
  payloadVisible = false;

  // Authentication
  selectedAuthType: 'vault' | 'value' = 'vault';

  // UI Sections
  section = {
    general: true,
    datasource: false
  };

  toggleSection(target: 'general' | 'datasource'): void {
    if (this.section[target]) return;

    if (target === 'datasource' && !this.isGeneralValid()) return;

    this.section.general = false;
    this.section.datasource = false;
    this.section[target] = true;
  }

  isGeneralValid(): boolean {
    return !!this.assetName?.trim() && !!this.assetId?.trim();
  }

  isDatasourceValid(): boolean {
    switch (this.selectedStorageType) {
      case 'rest':
        return !!this.restMethod?.trim() && !!this.restUrl?.trim();

      case 'amazonS3':
        return !!this.s3Region?.trim() &&
          !!this.s3Bucket?.trim() &&
          !!this.s3KeyName?.trim() &&
          !!this.s3AccessKey?.trim() &&
          !!this.s3SecretKey?.trim();

      case 'azure':
        return !!this.azureAccount?.trim() &&
          !!this.azureKeyName?.trim() &&
          !!this.azureContainer?.trim() &&
          !!this.azureBlobName?.trim();

      default:
        return false;
    }
  }

  // Headers & Payload
  additionalHeaders: { name: string; value: string }[] = [];
  customPayload: { contentType: string; body: string } | null = null;

  constructor(
    private dialogRef: MatDialogRef<AssetEditorDialog>,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[]
  ) {}

  ngOnInit(): void {}

  get hasPayload(): boolean {
    return !!this.customPayload;
  }

  get hasHeaders(): boolean {
    return this.additionalHeaders.length > 0;
  }

  toggleAuth(): void {
    this.authVisible = !this.authVisible;
  }

  toggleHeaders(): void {
    this.headersVisible = !this.headersVisible;
  }

  togglePayload(): void {
    this.customPayload = this.customPayload ? null : { contentType: '', body: '' };
  }

  addHeader(): void {
    this.additionalHeaders.push({ name: '', value: '' });
  }

  removeHeader(index: number): void {
    this.additionalHeaders.splice(index, 1);
  }

  isFormValid(): boolean {
    if (!this.isGeneralValid()) return false;

    return this.selectedStorageType === 'rest' && this.isRestValid()
      || this.selectedStorageType === 'amazonS3' && this.isS3Valid()
      || this.selectedStorageType === 'azure' && this.isAzureValid();
  }

  isRestValid(): boolean {
    return !!this.restMethod && !!this.restUrl;
  }

  isS3Valid(): boolean {
    return !!this.s3Region && !!this.s3Bucket && !!this.s3KeyName && !!this.s3AccessKey && !!this.s3SecretKey;
  }

  isAzureValid(): boolean {
    return !!this.azureAccount && !!this.azureKeyName && !!this.azureContainer && !!this.azureBlobName;
  }

  onStorageTypeChanged(): void {
    this.clearDatasourceFields();
  }

  // TODO
  //  -_ in the name is possible, also whitespaces, but whitespaces should be whenever theres a space, replace in ID with -
  // X in the search bar
  // Description is required
  //
  //
  // Region is text input

  clearDatasourceFields(): void {
    // Clear all types
    this.restMethod = '';
    this.restUrl = '';

    this.s3Region = '';
    this.s3Bucket = '';
    this.s3KeyName = '';
    this.s3AccessKey = '';
    this.s3SecretKey = '';

    this.azureAccount = '';
    this.azureKeyName = '';
    this.azureContainer = '';
    this.azureBlobName = '';
  }

  onSave(): void {
    const assetInput: AssetInput = {
      "@id": this.assetId,
      properties: {
        name: this.assetName,
        description: this.assetDescription,
        ontologyType: this.assetOntologyType
      },
      dataAddress: {
        type: this.storageTypeId,
        account: this.account,
        container: this.container,
        blobname: this.blobname,
        keyName: `${this.account}-key1`
      }
    };

    this.dialogRef.close({ assetInput });
  }
}
