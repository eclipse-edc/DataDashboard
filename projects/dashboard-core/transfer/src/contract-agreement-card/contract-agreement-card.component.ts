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
import { ContractAgreement, ContractNegotiation } from '@think-it-labs/edc-connector-client';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'lib-contract-agreement-card',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './contract-agreement-card.component.html',
  styleUrl: './contract-agreement-card.component.css',
})
export class ContractAgreementCardComponent {
  @Input() agreement!: ContractAgreement;
  @Input() negotiation!: ContractNegotiation;
  @Input() showButtons = true;
  @Input() disableTransfer = false;

  @Output() detailsEvent = new EventEmitter<ContractAgreement>();
  @Output() transferEvent = new EventEmitter<ContractAgreement>();
}
