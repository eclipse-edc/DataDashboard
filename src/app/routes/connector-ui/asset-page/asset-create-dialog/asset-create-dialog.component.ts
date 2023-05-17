import {Component, OnDestroy} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {AssetService} from '../../../../core/services/api/legacy-managent-api-client';
import {AssetEntryBuilder} from '../../../../core/services/asset-entry-builder';
import {NotificationService} from '../../../../core/services/notification.service';
import {ValidationMessages} from '../../../../core/validators/validation-messages';
import {AssetCreateDialogForm} from './asset-create-dialog-form';
import {AssetCreateDialogResult} from './asset-create-dialog-result';
import {AssetAdvancedFormBuilder} from './model/asset-advanced-form-builder';
import {AssetDatasourceFormBuilder} from './model/asset-datasource-form-builder';
import {AssetMetadataFormBuilder} from './model/asset-metadata-form-builder';

@Component({
  selector: 'asset-create-dialog',
  templateUrl: './asset-create-dialog.component.html',
  providers: [
    AssetAdvancedFormBuilder,
    AssetDatasourceFormBuilder,
    AssetCreateDialogForm,
    AssetEntryBuilder,
    AssetMetadataFormBuilder,
  ],
})
export class AssetCreateDialogComponent implements OnDestroy {
  loading = false;

  methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

  constructor(
    public form: AssetCreateDialogForm,
    public validationMessages: ValidationMessages,
    private assetEntryBuilder: AssetEntryBuilder,
    private notificationService: NotificationService,
    private assetService: AssetService,
    private dialogRef: MatDialogRef<AssetCreateDialogComponent>,
  ) {}

  onSave() {
    const formValue = this.form.value;
    const assetEntryDto = this.assetEntryBuilder.buildAssetEntry(formValue);

    this.form.all.disable();
    this.loading = true;
    this.assetService
      .createAsset(assetEntryDto)
      .pipe(
        takeUntil(this.ngOnDestroy$),
        finalize(() => {
          this.form.all.enable();
          this.loading = false;
        }),
      )
      .subscribe({
        complete: () => {
          this.notificationService.showInfo('Successfully created asset');
          this.close({refreshList: true});
        },
        error: (error) => {
          console.error('Failed creating asset!', error);
          this.notificationService.showError('Failed creating asset!');
        },
      });
  }

  private close(params: AssetCreateDialogResult) {
    this.dialogRef.close(params);
  }

  ngOnDestroy$ = new Subject();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
