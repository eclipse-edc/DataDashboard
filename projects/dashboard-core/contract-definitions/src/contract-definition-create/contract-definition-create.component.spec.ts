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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDefinitionCreateComponent } from './contract-definition-create.component';

describe('ContractDefinitionCreateComponent', () => {
  let component: ContractDefinitionCreateComponent;
  let fixture: ComponentFixture<ContractDefinitionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDefinitionCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDefinitionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
