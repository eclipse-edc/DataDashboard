import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StorageOption} from "../../../app/app-config.service";
import {FormBuilder, Validators} from "@angular/forms";


@Component({
  selector: 'edc-demo-catalog-browser-transfer-dialog',
  templateUrl: './catalog-browser-transfer-dialog.component.html',
  styleUrls: ['./catalog-browser-transfer-dialog.component.scss']
})
export class CatalogBrowserTransferDialog {

  storageType?: StorageOption;
  form = this.fb.group({});

  constructor(@Inject('HOME_CONNECTOR_STORAGES') public storageTypes: StorageOption[],
              private dialogRef: MatDialogRef<CatalogBrowserTransferDialog>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: any) {
  }

  onTransfer() {
    if (this.form.invalid) {
      return;
    }
    let dialogResult = {
      ...this.storageType,
      ...this.form.value
    };
    delete dialogResult.additionalTextFields;
    delete dialogResult.label;
    this.dialogRef.close(dialogResult);

  }

  changed(storageOption: StorageOption) {
    this.form = this.fb.group({});
    storageOption.additionalTextFields.forEach(field => {
      this.form.addControl(field.id, this.fb.control("", [Validators.required]))
    })
  }
}
