/*
 *  Copyright (c) 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V. - initial API and implementation
 *
 */

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { from, Observable, of, Subject, takeUntil } from 'rxjs';
import { DataAddress } from '@think-it-labs/edc-connector-client';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTypeRegistryService } from '../../../services/data-type-registry.service';

@Component({
  selector: 'lib-data-address-form',
  templateUrl: './data-address-form.component.html',
  imports: [AsyncPipe, ReactiveFormsModule, NgClass],
})
export class DataAddressFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly dataTypeService = inject(DataTypeRegistryService);
  private readonly formBuilder = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  @ViewChild('dataAddressComponent', { read: ViewContainerRef, static: true })
  private readonly dataAddressComponent!: ViewContainerRef;

  @Input() showDivider = true;
  @Input() parentForm?: FormGroup;
  @Input() dataType?: string;
  @Input() dataAddress?: DataAddress;
  @Output() dataAddressChange = new EventEmitter<DataAddress>();

  allowedTypes$: Observable<Set<string>> = of();
  private validDataAddress = false;

  private readonly FORM_GROUP_NAME = 'dataAddress';
  dataTypeForm: FormGroup;

  constructor() {
    this.dataTypeForm = this.formBuilder.group({
      dataType: new FormControl(undefined, {
        validators: [Validators.required, () => (this.validDataAddress ? null : { invalidDataType: true })],
      }),
    });
    this.dataTypeForm
      .get('dataType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.onDataTypeChange(type);
      });
  }

  async ngOnInit() {
    if (!this.dataType) {
      this.allowedTypes$ = from(this.dataTypeService.getAllowedSourceTypes());
    }
  }

  ngOnChanges() {
    if (this.dataAddress?.type != this.dataTypeForm.value.dataType) {
      this.dataTypeForm.get('dataType')?.setValue(this.dataAddress?.type);
    }
    if (this.dataType) {
      this.dataTypeForm.get('dataType')?.setValue(this.dataType);
    }
    this.parentForm?.addControl(this.FORM_GROUP_NAME, this.dataTypeForm);
  }

  onDataTypeChange(type: string) {
    this.validDataAddress = false;
    this.dataAddressComponent.clear();
    const typeComponent = this.dataTypeService.getComponent(type);
    const ref = this.dataAddressComponent.createComponent(typeComponent);
    ref.setInput('type', type);
    ref.setInput('dataAddress', this.dataAddress);
    ref.setInput('parentForm', this.dataTypeForm);
    const sub = ref.instance.changed.subscribe(address => this.dataAddressChange.emit(address));
    ref.onDestroy(() => sub.unsubscribe());
    this.validDataAddress = ref.instance.formGroup.valid;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.parentForm?.removeControl(this.FORM_GROUP_NAME);
  }
}
