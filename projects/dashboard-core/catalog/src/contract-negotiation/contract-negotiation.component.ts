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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { compact, EdcConnectorClientError, IdResponse } from '@think-it-labs/edc-connector-client';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertComponent, JsonObjectTableComponent } from '@eclipse-edc/dashboard-core';
import { CatalogService } from '../catalog.service';
import { ContractNegotiationRequest } from '@think-it-labs/edc-connector-client/dist/src/entities';
import { CatalogDataset } from '../catalog-dataset';
import { BehaviorSubject } from 'rxjs';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-catalog-negotiation',
  standalone: true,
  imports: [FormsModule, AlertComponent, JsonObjectTableComponent, NgClass, AsyncPipe],
  templateUrl: './contract-negotiation.component.html',
})
export class ContractNegotiationComponent implements OnChanges {
  @Input() catalogDataset!: CatalogDataset;
  @Output() negotiationRequested = new EventEmitter<IdResponse>();

  dataset: Record<string, JsonValue> = {};
  catalog: Record<string, JsonValue> = {};
  errorMsg = '';
  offerId = '';
  selectedOffer = new BehaviorSubject<string[]>(['']);

  constructor(private readonly catalogService: CatalogService) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['catalogDataset']) {
      await this.loadDataset();
    }
  }

  private async loadDataset() {
    if (this.catalogDataset) {
      try {
        this.dataset = await compact(this.catalogDataset.dataset);
        this.catalog = this.getCatalogAsRecord();
      } catch (error) {
        console.error('Error compacting dataset:', error);
      }
    }
  }

  startNegotiation() {
    const policy = this.catalogDataset.offers.get(this.offerId);
    if (policy != undefined) {
      const request: ContractNegotiationRequest = {
        counterPartyAddress: this.catalogDataset.originator,
        policy: policy,
      };

      this.catalogService
        .initiateNegotiation(request)
        .then(async (idResponse: IdResponse) => {
          this.negotiationRequested.emit(idResponse);
        })
        .catch((error: EdcConnectorClientError) => {
          this.errorMsg = error.message;
        });
    } else {
      this.errorMsg = 'No offer selected!';
    }
  }

  async showOfferDetails(selectedOfferId: string) {
    const policy = this.catalogDataset.offers.get(selectedOfferId);

    if (policy !== undefined) {
      const excludedProperties = ['@context', 'assigner', '@type', 'target'];

      const offer = JSON.stringify(
        policy,
        (key, value) => {
          if (excludedProperties.includes(key)) {
            return undefined;
          }
          return value;
        },
        2,
      ).split('\n');

      this.selectedOffer.next(offer);
    }
  }

  private getCatalogAsRecord(): Record<string, JsonValue> {
    return {
      id: this.catalogDataset.id,
      participantId: this.catalogDataset.participantId,
      originator: this.catalogDataset.originator,
    };
  }

  get offerKeys() {
    return Array.from(this.catalogDataset.offers.keys());
  }
}
