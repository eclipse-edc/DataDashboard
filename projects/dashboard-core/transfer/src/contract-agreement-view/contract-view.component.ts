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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { compact, ContractAgreement, ContractNegotiation, IdResponse } from '@think-it-labs/edc-connector-client';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import {
  ConsumerProviderSwitchComponent,
  DashboardStateService,
  FilterInputComponent,
  ItemCountSelectorComponent,
  JsonldViewerComponent,
  ModalAndAlertService,
  PaginationComponent,
  Pair,
} from '@eclipse-edc/dashboard-core';
import { ContractAndTransferService } from '../contract-and-transfer.service';
import { ContractAgreementCardComponent } from '../contract-agreement-card/contract-agreement-card.component';
import { AsyncPipe, NgClass } from '@angular/common';
import { TransferProgressComponent } from '../transfer-progress/transfer-progress.component';
import { TransferCreateComponent } from '../transfer-create/transfer-create.component';

@Component({
  selector: 'lib-contract-agreement-view',
  standalone: true,
  imports: [
    FilterInputComponent,
    PaginationComponent,
    ContractAgreementCardComponent,
    AsyncPipe,
    NgClass,
    ConsumerProviderSwitchComponent,
    ItemCountSelectorComponent,
  ],
  templateUrl: './contract-view.component.html',
  styleUrl: './contract-view.component.css',
})
export class ContractViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  pairs$: Observable<Pair<ContractAgreement, ContractNegotiation>[]> = of([]);
  filteredPairs$: Observable<Pair<ContractAgreement, ContractNegotiation>[]> = of([]);
  pagePairs$: Observable<Pair<ContractAgreement, ContractNegotiation>[]> = of([]);
  pageItemCount = 15;
  initialized = false;
  contractType: 'CONSUMER' | 'PROVIDER' = 'CONSUMER';

  constructor(
    private readonly contractAndTransferService: ContractAndTransferService,
    private readonly modalAndAlertService: ModalAndAlertService,
    private readonly stateService: DashboardStateService,
  ) {}

  async ngOnInit() {
    await this.fetchAgreements();
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.fetchAgreements.bind(this));
  }

  private async fetchAgreements(): Promise<void> {
    this.initialized = false;
    const negotiations = await this.contractAndTransferService.getAllContractNegotiations({
      sortField: 'createdAt',
      sortOrder: 'DESC',
      filterExpression: [
        {
          operandLeft: 'type',
          operator: '=',
          operandRight: this.contractType,
        },
        {
          operandLeft: 'state',
          operator: '=',
          // 1200 = 'FINALIZED'
          // ToDo: Wait for upstream fix to be able to use string 'FINALIZED'
          operandRight: 1200,
        },
      ],
    });
    const pairs = await Promise.all(
      negotiations.map(async negotiation => {
        const agreement = await this.contractAndTransferService.getAgreementForNegotiation(negotiation.id);
        return [agreement, await compact(negotiation)] as Pair<ContractAgreement, ContractNegotiation>;
      }),
    );
    this.initialized = true;
    this.pairs$ = this.filteredPairs$ = of(pairs);
  }

  filter(searchText: string) {
    if (searchText) {
      const lower = searchText.toLowerCase();
      this.filteredPairs$ = this.pairs$.pipe(
        map(agreements =>
          agreements.filter(
            agreement =>
              agreement[0].id.toLowerCase().includes(lower) ||
              agreement[0].providerId.toLowerCase().includes(lower) ||
              agreement[0].assetId.toLowerCase().includes(lower),
          ),
        ),
      );
    } else {
      this.filteredPairs$ = this.pairs$;
    }
  }

  paginationEvent(pageItems: Pair<ContractAgreement, ContractNegotiation>[]) {
    this.pagePairs$ = of(pageItems);
  }

  openDetails(agreement: ContractAgreement) {
    this.modalAndAlertService.openModal(JsonldViewerComponent, { jsonLdObject: agreement });
  }

  openTransferDialog(pair: Pair<ContractAgreement, ContractNegotiation>) {
    const callbacks = {
      transferId: (id: IdResponse) => {
        this.openProgressDialog(id, pair);
      },
    };
    this.modalAndAlertService.openModal(
      TransferCreateComponent,
      { agreement: pair[0], negotiation: pair[1] },
      callbacks,
    );
  }

  openProgressDialog(id: IdResponse, pair: Pair<ContractAgreement, ContractNegotiation>) {
    this.modalAndAlertService.openModal(
      TransferProgressComponent,
      { transferId: id, agreement: pair[0], negotiation: pair[1] },
      undefined,
      true,
    );
  }

  async onTypeChange(type: 'CONSUMER' | 'PROVIDER') {
    this.contractType = type;
    await this.fetchAgreements();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
