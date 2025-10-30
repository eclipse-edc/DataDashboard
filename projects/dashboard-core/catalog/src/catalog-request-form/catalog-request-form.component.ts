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

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CatalogRequest } from '@think-it-labs/edc-connector-client/dist/src/entities/catalog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardStateService, DID_WEB_REGEX, URL_REGEX } from '@eclipse-edc/dashboard-core';
import { AsyncPipe, NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-catalog-request-form',
  templateUrl: './catalog-request-form.component.html',
  imports: [ReactiveFormsModule, NgClass, AsyncPipe],
})
export class CatalogRequestFormComponent implements OnInit {
  readonly stateService = inject(DashboardStateService);

  @Output() request = new EventEmitter<CatalogRequest>();

  requestForm: FormGroup = new FormGroup({
    counterPartyAddress: new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
  });

  async ngOnInit() {
    const conf = await firstValueFrom(this.stateService.currentEdcConfig$);
    if (conf?.did) {
      this.requestForm.addControl(
        'counterPartyId',
        new FormControl('', [Validators.required, Validators.pattern(DID_WEB_REGEX)]),
      );
    } else {
      this.requestForm.addControl('counterPartyId', new FormControl(''));
    }
  }

  onRequest(): void {
    const catalogRequest: CatalogRequest = {
      counterPartyAddress: this.requestForm.value.counterPartyAddress,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (catalogRequest as any).counterPartyId = this.requestForm.value.counterPartyId;
    this.request.emit(catalogRequest);
  }
}
