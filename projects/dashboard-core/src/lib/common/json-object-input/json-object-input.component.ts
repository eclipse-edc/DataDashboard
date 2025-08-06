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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JsonValue } from '@angular-devkit/core';
import { JsonObjectTableComponent } from '../json-object-table/json-object-table.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'lib-json-object-input',
  templateUrl: './json-object-input.component.html',
  styleUrl: './json-object-input.component.css',
  imports: [JsonObjectTableComponent, ReactiveFormsModule],
})
export class JsonObjectInputComponent {
  @Input() object?: Record<string, JsonValue>;
  @Input() excludeKeys: string[] = [];
  @Output() objectChange = new EventEmitter<Record<string, JsonValue>>();

  formGroup = new FormGroup({
    key: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
  });

  addProperty() {
    if (this.formGroup.valid) {
      const key = this.formGroup.value.key!;
      const value = JsonObjectInputComponent.parseJson(this.formGroup.value.value!);
      this.objectChange.emit({ ...this.object, [key]: value });
      this.formGroup.reset();
    }
  }

  public static parseJson(input: string): JsonValue {
    if (input === 'true' || input === 'false') {
      return input === 'true';
    } else if (!isNaN(Number(input))) {
      return Number(input);
    }
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }

  deleteProperty(key: string) {
    if (this.object) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = this.object;
      this.objectChange.emit(rest);
    }
  }
}
