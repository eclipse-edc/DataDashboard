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
import { CatalogService } from '../catalog.service';
import { AsyncPipe } from '@angular/common';
import {
  BehaviorSubject,
  catchError,
  finalize,
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import {
  DashboardStateService,
  FilterInputComponent,
  ItemCountSelectorComponent,
  JsonldViewerComponent,
  ModalAndAlertService,
  PaginationComponent,
} from '@eclipse-edc/dashboard-core';
import { CatalogDataset } from '../catalog-dataset';
import { CatalogCardComponent } from '../catalog-card/catalog-card.component';
import { ContractNegotiationComponent } from '../contract-negotiation/contract-negotiation.component';
import { CatalogRequestComponent } from '../catalog-request/catalog-request.component';
import { CatalogRequest } from '@think-it-labs/edc-connector-client/dist/src/entities/catalog';
import { IdResponse } from '@think-it-labs/edc-connector-client';
import { NegotiationProgressComponent } from '../negotiation-progress/negotiation-progress.component';

@Component({
  selector: 'lib-catalog-view',
  standalone: true,
  imports: [
    AsyncPipe,
    FilterInputComponent,
    PaginationComponent,
    CatalogCardComponent,
    CatalogRequestComponent,
    ItemCountSelectorComponent,
  ],
  templateUrl: './catalog-view.component.html',
  styleUrl: './catalog-view.component.css',
})
export class CatalogViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  catalogDatasets$: Observable<CatalogDataset[]> = of([]);
  filteredCatalogDatasets$: Observable<CatalogDataset[]> = of([]);
  pageCatalogDatasets$: Observable<CatalogDataset[]> = of([]);
  hasCatalogDatasets$ = new BehaviorSubject<boolean>(false);

  pageItemCount = 15;

  catalogViewState = {
    isLoading: false,
    showSearchTooltip: true,
    emptyCatalogMsg: 'No catalog has been requested yet...',
  };

  isFederatedCatalogEnabled = false;
  errorMsg = '';

  constructor(
    public stateService: DashboardStateService,
    private readonly catalogService: CatalogService,
    private readonly modalAndAlertService: ModalAndAlertService,
  ) {}

  async ngOnInit() {
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      this.catalogDatasets$ = this.filteredCatalogDatasets$ = of([]);
      this.hasCatalogDatasets$.next(false);
      if (await firstValueFrom(this.stateService.isFederatedCatalogEnabled$)) {
        this.isFederatedCatalogEnabled = true;
        await this.getFederatedCatalogs();
      } else {
        this.isFederatedCatalogEnabled = false;
        this.resetCatalogViewState();
      }
    });
  }

  private async getFederatedCatalogs() {
    this.catalogViewState.isLoading = true;
    this.catalogDatasets$ = from(this.catalogService.getAllCatalogDatasets()).pipe(
      tap((catalogDatasets: CatalogDataset[]) => {
        this.hasCatalogDatasets$.next((catalogDatasets ?? []).length > 0);
        this.updateCatalogDatasetState(catalogDatasets, true, '');
      }),
      finalize(() => {
        this.catalogViewState.isLoading = false;
      }),
    );
    this.filteredCatalogDatasets$ = this.catalogDatasets$;
  }

  async getCatalog(catalogRequest: CatalogRequest) {
    if (catalogRequest.counterPartyAddress) {
      return await this.getCatalogByAddress(catalogRequest);
    } else if (!catalogRequest.counterPartyAddress && this.isFederatedCatalogEnabled) {
      return await this.getFederatedCatalogs();
    }
  }

  async getCatalogByAddress(catalogRequest: CatalogRequest) {
    this.catalogViewState.isLoading = true;
    this.catalogDatasets$ = from(this.catalogService.getCatalogDataset(catalogRequest)).pipe(
      tap((catalogDatasets: CatalogDataset[]) => {
        this.hasCatalogDatasets$.next((catalogDatasets ?? []).length > 0);
        this.updateCatalogDatasetState(catalogDatasets, false, '', catalogRequest.counterPartyAddress);
      }),
      catchError(error => {
        this.errorMsg = error?.message || `Failed to request catalog from '${catalogRequest.counterPartyAddress}'`;
        this.hasCatalogDatasets$.next(false);
        this.updateCatalogDatasetState([], false, this.errorMsg, catalogRequest.counterPartyAddress);
        this.modalAndAlertService.showAlert(this.errorMsg, 'Failed to request catalog', 'error', 5);
        return of([]);
      }),
      finalize(() => {
        this.catalogViewState.isLoading = false;
      }),
    );
    this.filteredCatalogDatasets$ = this.catalogDatasets$;
  }

  private updateCatalogDatasetState(
    catalogDatasets: CatalogDataset[],
    isFederatedCatalogRequest: boolean,
    errorMsg: string,
    counterPartyAddress = '',
  ) {
    const isEmpty = catalogDatasets.length === 0;
    const noResultFound = isEmpty && !errorMsg;
    const emptyCatalogMsg = noResultFound
      ? isFederatedCatalogRequest
        ? 'Empty catalog! Federated catalog has no dataset.'
        : `Empty catalog! The counter party '${counterPartyAddress}' has no dataset.`
      : errorMsg || this.catalogViewState.emptyCatalogMsg;
    this.catalogViewState.showSearchTooltip = isFederatedCatalogRequest ? isEmpty : false;
    this.catalogViewState.emptyCatalogMsg = emptyCatalogMsg;
  }

  filter(searchText: string) {
    if (searchText) {
      const lower = searchText.toLowerCase();
      this.filteredCatalogDatasets$ = this.catalogDatasets$.pipe(
        map(catalogDatasets =>
          catalogDatasets.filter(
            catalogDataset =>
              catalogDataset.assetId.toLowerCase().includes(lower) ||
              catalogDataset.participantId.toLowerCase().includes(lower),
          ),
        ),
      );
    } else {
      this.filteredCatalogDatasets$ = this.catalogDatasets$;
    }
  }

  paginationEvent(pageItems: CatalogDataset[]) {
    this.pageCatalogDatasets$ = of(pageItems);
  }

  openDetails(catalogDataset: CatalogDataset) {
    this.modalAndAlertService.openModal(JsonldViewerComponent, { jsonLdObject: catalogDataset.dataset });
  }

  negotiateContract(catalogDataset: CatalogDataset) {
    const callbacks = {
      negotiationRequested: (id: IdResponse) => {
        this.modalAndAlertService.openModal(NegotiationProgressComponent, { negotiationId: id }, undefined, true);
      },
    };
    this.modalAndAlertService.openModal(ContractNegotiationComponent, { catalogDataset: catalogDataset }, callbacks);
  }

  private resetCatalogViewState() {
    this.catalogViewState.showSearchTooltip = true;
    this.catalogViewState.emptyCatalogMsg = 'No catalog has been requested yet...';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
