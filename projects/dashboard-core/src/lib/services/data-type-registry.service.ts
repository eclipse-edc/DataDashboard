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

import { Injectable, Type, inject } from '@angular/core';
import { HttpDataTypeComponent } from '../common/data-address/http-data-type/http-data-type.component';
import { FallbackDataTypeComponent } from '../common/data-address/fallback-data-type/fallback-data-type.component';
import { DataTypeInputComponent } from '../common/data-address/data-type-input/data-type-input.component';
import { EdcClientService } from './edc-client.service';

@Injectable({
  providedIn: 'root',
})
export class DataTypeRegistryService {
  private readonly edc = inject(EdcClientService);

  private readonly inputComponents: Map<string, Type<DataTypeInputComponent>> = new Map<
    string,
    Type<DataTypeInputComponent>
  >();

  constructor() {
    this.registerComponent('HttpData', HttpDataTypeComponent);
  }

  public getComponent(type: string): Type<DataTypeInputComponent> {
    if (this.inputComponents.has(type)) {
      return this.inputComponents.get(type)!;
    }
    return FallbackDataTypeComponent;
  }

  public registerComponent(type: string, component: Type<DataTypeInputComponent>) {
    this.inputComponents.set(type, component);
  }

  public async getAllowedSourceTypes(): Promise<Set<string>> {
    const allowedTypes = new Set<string>();
    (await (await this.edc.getClient()).management.dataplanes.list()).forEach(dp => {
      dp.allowedSourceTypes.forEach(it => allowedTypes.add(it.toString()));
    });
    return allowedTypes;
  }
}
