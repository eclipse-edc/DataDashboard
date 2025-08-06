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

import { Component } from '@angular/core';
import { DataTypeInputComponent } from '../data-type-input/data-type-input.component';
import { JsonObjectInputComponent } from '../../json-object-input/json-object-input.component';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-fallback-data-type',
  templateUrl: './fallback-data-type.component.html',
  imports: [JsonObjectInputComponent],
})
export class FallbackDataTypeComponent extends DataTypeInputComponent {
  constructor() {
    super();
  }

  dataAddressChange(address: Record<string, JsonValue>): void {
    this.dataAddress = { ...address, type: this.type! };
    this.changed.emit(this.dataAddress);
  }
}
