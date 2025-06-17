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
  id = '';
  name = '';
  description = '';
  publisher = '';

  // Storage
  storageTypeId = 'AzureStorage';
  account = '';
  container = 'src-container';
  blobname = '';

  // Visibility Toggles
  authVisible = false;
  headersVisible = false;
  payloadVisible = false;

  // Authentication
  selectedAuthType: 'vault' | 'value' = 'vault';

  ontologyType: string = 'Organization';

  // Headers & Payload
  additionalHeaders: { name: string; value: string }[] = [];
  customPayload: { contentType: string; body: string } | null = null;

  constructor(
    private dialogRef: MatDialogRef<AssetEditorDialog>,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[]
  ) {}

  ngOnInit(): void {}

  // Getters
  get hasPayload(): boolean {
    return !!this.customPayload;
  }

  get hasHeaders(): boolean {
    return this.additionalHeaders.length > 0;
  }

  // Toggle Methods
  toggleAuth(): void {
    this.authVisible = !this.authVisible;
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

  onSave(): void {
    const assetInput: AssetInput = {
      "@id": this.id,
      properties: {
        name: this.name,
        description: this.description,
        publisher: this.publisher,
        ontologyType: this.ontologyType
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

