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

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TransferProcess } from '@think-it-labs/edc-connector-client';
import { from, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { TransferHistoryTableComponent } from '../transfer-history-table/transfer-history-table.component';
import { AsyncPipe } from '@angular/common';
import {
  ConsumerProviderSwitchComponent,
  DashboardStateService,
  FilterInputComponent,
  ItemCountSelectorComponent,
  PaginationComponent,
} from '@eclipse-edc/dashboard-core';
import { ContractAndTransferService } from '../contract-and-transfer.service';

@Component({
  selector: 'lib-transfer-history',
  templateUrl: './transfer-history-view.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `,
  ],
  imports: [
    TransferHistoryTableComponent,
    AsyncPipe,
    PaginationComponent,
    FilterInputComponent,
    ItemCountSelectorComponent,
    ConsumerProviderSwitchComponent,
  ],
})
export class TransferHistoryViewComponent implements OnInit, OnDestroy {
  private readonly transferProcessService = inject(ContractAndTransferService);
  private readonly stateService = inject(DashboardStateService);

  private readonly destroy$ = new Subject<void>();

  transferProcesses$: Observable<TransferProcess[]> = of([]);
  filteredTransferProcesses$: Observable<TransferProcess[]> = of([]);
  pageTransferProcesses$: Observable<TransferProcess[]> = of([]);

  pageItemCount = 20;
  initialized = false;
  contractType: 'CONSUMER' | 'PROVIDER' = 'CONSUMER';

  async ngOnInit(): Promise<void> {
    await this.fetchHistory();
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.fetchHistory.bind(this));
  }

  private async fetchHistory() {
    this.transferProcesses$ = this.filteredTransferProcesses$ = from(
      this.transferProcessService.getAllTransferProcesses({
        '@type': 'QuerySpec',
        sortField: 'stateTimestamp',
        sortOrder: 'DESC',
        filterExpression: [
          {
            '@type': 'Criterion',
            operandLeft: 'type',
            operator: '=',
            operandRight: this.contractType,
          },
        ],
      }),
    );
  }

  paginationEvent(pageItems: TransferProcess[]) {
    this.pageTransferProcesses$ = of(pageItems);
  }

  filter(searchText: string) {
    if (searchText) {
      const lower = searchText.toLowerCase();
      this.filteredTransferProcesses$ = this.transferProcesses$.pipe(
        map(transferProcesses =>
          transferProcesses.filter(
            transferProcess =>
              transferProcess.assetId.toLowerCase().includes(lower) ||
              transferProcess.state.toLowerCase().includes(lower) ||
              transferProcess.mandatoryValue<string>('edc', 'transferType').toLowerCase().includes(lower) ||
              transferProcess.contractId.toLowerCase().includes(lower) ||
              transferProcess.id.toLowerCase().includes(lower),
          ),
        ),
      );
    } else {
      this.filteredTransferProcesses$ = this.transferProcesses$;
    }
  }

  async onTypeChange(type: 'CONSUMER' | 'PROVIDER') {
    this.contractType = type;
    await this.fetchHistory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
