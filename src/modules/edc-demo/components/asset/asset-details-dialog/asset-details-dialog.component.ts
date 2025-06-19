import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asset } from '../../../../mgmt-api-client/model';

@Component({
  selector: 'edc-demo-asset-details-dialog',
  templateUrl: './asset-details-dialog.component.html',
  styleUrls: ['./asset-details-dialog.component.scss']
})
export class AssetDetailsDialogComponent {
  keyMap = {
    name: 'https://w3id.org/edc/v0.0.1/ns/name',
    description: 'https://w3id.org/edc/v0.0.1/ns/description',
    ontologyType: 'https://w3id.org/edc/v0.0.1/ns/ontologyType',
    datasourceType: 'https://w3id.org/edc/v0.0.1/ns/type',
    mediaType: 'https://w3id.org/edc/v0.0.1/ns/mediaType',
    keywords: 'https://w3id.org/edc/v0.0.1/ns/keyword',
    qualityNote: 'https://w3id.org/edc/v0.0.1/ns/qualityNote',
    language: 'https://w3id.org/edc/v0.0.1/ns/language'
  };


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { asset: Asset },
    private dialogRef: MatDialogRef<AssetDetailsDialogComponent>
  ) {}

  formatKeywords(raw: any): string {
    if (Array.isArray(raw)) {
      return raw.join('; ');
    }
    return typeof raw === 'string' ? raw : '-';
  }


  mapDatasourceType(raw: string): string {
    const map = {
      HttpData: 'REST-API endpoint',
      AmazonS3: 'Amazon S3',
      AzureStorage: 'Azure Blob Storage'
    };

    return map[raw as keyof typeof map] || raw || '-';
  }


  getNestedProp(fullKey: string): string {
    const props = this.data.asset?.properties || {};
    const valueArray = props[fullKey];
    if (Array.isArray(valueArray) && valueArray.length > 0) {
      return valueArray[0]['@value'] || '-';
    }
    return '-';
  }

  getDataAddressProp(fullKey: string): string {
    const dataAddressArr = this.data.asset?.['https://w3id.org/edc/v0.0.1/ns/dataAddress'];
    if (Array.isArray(dataAddressArr) && dataAddressArr.length > 0) {
      const valueArray = dataAddressArr[0]?.[fullKey];
      if (Array.isArray(valueArray) && valueArray.length > 0) {
        return valueArray[0]['@value'] || '-';
      }
    }
    return '-';
  }



  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close({ delete: true });
  }
}
