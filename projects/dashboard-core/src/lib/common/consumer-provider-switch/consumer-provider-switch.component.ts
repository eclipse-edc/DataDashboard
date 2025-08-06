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
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-consumer-provider-switch',
  templateUrl: './consumer-provider-switch.component.html',
  imports: [NgClass],
})
export class ConsumerProviderSwitchComponent {
  @Input() initialType = 'CONSUMER';
  @Input() consumerTooltip?: string;
  @Input() providerTooltip?: string;
  @Output() changed = new EventEmitter<'CONSUMER' | 'PROVIDER'>();
}
