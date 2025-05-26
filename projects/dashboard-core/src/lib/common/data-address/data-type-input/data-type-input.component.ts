import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DataAddress } from '@think-it-labs/edc-connector-client';
import { FormGroup } from '@angular/forms';

@Component({
  template: '',
})
export class DataTypeInputComponent implements OnChanges, OnDestroy {
  @Input() type?: string;
  @Input() dataAddress?: DataAddress;
  @Input() parentForm?: FormGroup;
  @Output() changed = new EventEmitter<DataAddress>();

  private readonly FORM_GROUP_NAME = 'dataTypeForm';

  formGroup: FormGroup;
  constructor() {
    this.formGroup = new FormGroup({});
  }

  getForm(): FormGroup {
    return this.formGroup;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.parentForm?.addControl(this.FORM_GROUP_NAME, this.formGroup);
  }

  ngOnDestroy() {
    this.parentForm?.removeControl(this.FORM_GROUP_NAME);
  }
}
