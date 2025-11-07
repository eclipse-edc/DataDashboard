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

import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { DashboardStateService, EdcConfig, ModalAndAlertService } from '@eclipse-edc/dashboard-core';
import { FormsModule } from '@angular/forms';
import { CatalogRequest } from '@think-it-labs/edc-connector-client/dist/src/entities/catalog';
import { AsyncPipe, NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CatalogRequestFormComponent } from '../catalog-request-form/catalog-request-form.component';

@Component({
  selector: 'lib-catalog-request',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgClass],
  templateUrl: './catalog-request.component.html',
})
export class CatalogRequestComponent implements OnDestroy {
  readonly stateService = inject(DashboardStateService);
  private readonly modalAndAlertService = inject(ModalAndAlertService);

  private readonly destroy$ = new Subject<void>();

  @ViewChild('connectorSelect', { static: false }) connectorSelect?: ElementRef;

  @Input() showSearchTooltip = false;
  @Input() federatedCatalog = false;
  @Output() catalogRequested = new EventEmitter<CatalogRequest>();

  protocol = 'dataspace-protocol-http';
  selectedConnector?: EdcConfig;

  constructor() {
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.resetSelector.bind(this));
  }

  getCatalog() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.selectedConnector) {
      const request: CatalogRequest = {
        counterPartyAddress: this.selectedConnector.protocolUrl,
      };
      if (this.selectedConnector.did) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any).counterPartyId = this.selectedConnector.did;
      }
      this.catalogRequested.emit(request);
    }
  }

  openRequestForm() {
    this.modalAndAlertService.openModal(CatalogRequestFormComponent, undefined, {
      request: (request: CatalogRequest) => {
        this.modalAndAlertService.closeModal();
        this.getUnknownCatalog(request);
      },
    });
  }

  getUnknownCatalog(request: CatalogRequest): void {
    this.resetSelector();
    this.catalogRequested.emit(request);
  }

  private resetSelector() {
    this.selectedConnector = undefined;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
