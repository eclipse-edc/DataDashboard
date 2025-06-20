import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asset } from '../../../../mgmt-api-client/model';

@Component({
  selector: 'edc-demo-asset-details-dialog',
  templateUrl: './asset-details-dialog.component.html',
  styleUrls: ['./asset-details-dialog.component.scss']
})
export class AssetDetailsDialogComponent {
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

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close({ delete: true });
  }
}
