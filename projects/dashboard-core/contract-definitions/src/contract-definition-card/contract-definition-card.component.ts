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
import { ContractDefinition } from '@think-it-labs/edc-connector-client';

@Component({
  selector: 'lib-contract-definition-card',
  imports: [],
  templateUrl: './contract-definition-card.component.html',
  standalone: true,
  styleUrl: './contract-definition-card.component.css',
})
export class ContractDefinitionCardComponent {
  @Input() contractDefinition!: ContractDefinition;
  @Input() showButtons = true;

  @Output() openDetailsEvent = new EventEmitter<ContractDefinition>();
  @Output() editContractDefinitionEvent = new EventEmitter<ContractDefinition>();
  @Output() deleteContractDefinitionEvent = new EventEmitter<ContractDefinition>();
}
