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

import { TestBed } from '@angular/core/testing';
import { DataTypeRegistryService } from './data-type-registry.service';
import { EdcClientService } from './edc-client.service';
import { HttpDataTypeComponent } from '../common/data-address/http-data-type/http-data-type.component';
import { FallbackDataTypeComponent } from '../common/data-address/fallback-data-type/fallback-data-type.component';

class MockEdcClientService {
  getClient() {
    return {
      management: {
        dataplanes: {
          list: () => Promise.resolve([{ allowedSourceTypes: ['Type1', 'Type2'] }]),
        },
      },
    };
  }
}

describe('DataTypeRegistryService', () => {
  let service: DataTypeRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataTypeRegistryService, { provide: EdcClientService, useClass: MockEdcClientService }],
    });

    service = TestBed.inject(DataTypeRegistryService);
    // mockEdcClientService = TestBed.inject(EdcClientService);
  });

  it('should register and retrieve a component', () => {
    service.registerComponent('HttpData', HttpDataTypeComponent);
    const component = service.getComponent('HttpData');
    expect(component).toBe(HttpDataTypeComponent);
  });

  it('should return FallbackDataTypeComponent for unregistered types', () => {
    const component = service.getComponent('UnknownType');
    expect(component).toBe(FallbackDataTypeComponent);
  });

  it('should get allowed source types', async () => {
    const allowedTypes = await service.getAllowedSourceTypes();
    expect(allowedTypes.has('Type1')).toBeTrue();
    expect(allowedTypes.has('Type2')).toBeTrue();
  });
});
