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
import { AssetService } from '../asset.service';
import { AsyncPipe } from '@angular/common';
import { Asset, IdResponse } from '@think-it-labs/edc-connector-client';
import { from, map, Observable, of, Subject, takeUntil } from 'rxjs';
import {
  DashboardStateService,
  DeleteConfirmComponent,
  FilterInputComponent,
  ItemCountSelectorComponent,
  JsonldViewerComponent,
  ModalAndAlertService,
  PaginationComponent,
} from '@eclipse-edc/dashboard-core';
import { AssetCreateComponent } from '../asset-create/asset-create.component';
import { AssetCardComponent } from '../asset-card/asset-card.component';

@Component({
  selector: 'lib-asset-view',
  standalone: true,
  imports: [AsyncPipe, FilterInputComponent, PaginationComponent, AssetCardComponent, ItemCountSelectorComponent],
  templateUrl: './asset-view.component.html',
  styleUrl: './asset-view.component.css',
})
export class AssetViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  assets$: Observable<Asset[]> = of([]);
  filteredAssets$: Observable<Asset[]> = of([]);
  pageAssets$: Observable<Asset[]> = of([]);
  fetched = false;
  pageItemCount = 15;

  constructor(
    private readonly assetService: AssetService,
    private readonly modalAndAlertService: ModalAndAlertService,
    private readonly stateService: DashboardStateService,
  ) {
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.fetchAssets.bind(this));
  }

  async ngOnInit() {
    this.fetchAssets();
  }

  filter(searchText: string) {
    if (searchText) {
      const lower = searchText.toLowerCase();
      this.filteredAssets$ = this.assets$.pipe(
        map(assets =>
          assets.filter(
            asset =>
              asset.id.includes(searchText) ||
              asset.properties.optionalValue<string>('edc', 'name')?.toLowerCase().includes(lower) ||
              asset.properties.optionalValue<string>('edc', 'contenttype')?.toLowerCase().includes(lower) ||
              asset.dataAddress.mandatoryValue<string>('edc', 'type').toLowerCase().includes(lower),
          ),
        ),
      );
    } else {
      this.filteredAssets$ = this.assets$;
    }
  }

  paginationEvent(pageItems: Asset[]) {
    this.pageAssets$ = of(pageItems);
  }

  createAsset() {
    const callbacks = {
      created: (id: IdResponse) => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(`Asset with ID '${id.id}'`, 'created successfully', 'success', 5);
        this.fetchAssets();
      },
    };
    this.modalAndAlertService.openModal(AssetCreateComponent, undefined, callbacks);
  }

  editAsset(asset: Asset) {
    const callbacks = {
      updated: () => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(`Asset with ID '${asset.id}'`, 'updated successfully', 'success', 5);
        this.fetchAssets();
      },
    };
    this.modalAndAlertService.openModal(AssetCreateComponent, { asset: asset }, callbacks);
  }

  deleteAsset(asset: Asset) {
    this.modalAndAlertService.openModal(
      DeleteConfirmComponent,
      {
        customText: 'Do you really want to delete this Asset?',
        componentType: AssetCardComponent,
        componentInputs: { asset: asset, showButtons: false },
      },
      {
        canceled: () => this.modalAndAlertService.closeModal(),
        confirm: () => {
          this.modalAndAlertService.closeModal();
          this.assetService
            .deleteAsset(asset.id)
            .then(() => {
              const msg = `Asset '${asset.id}' deleted successfully`;
              this.modalAndAlertService.showAlert(msg, undefined, 'success', 5);
              this.fetchAssets();
            })
            .catch(error => {
              console.error(error);
              const msg = `Deletion of asset '${asset.id}' failed`;
              this.modalAndAlertService.showAlert(msg, undefined, 'error', 5);
            });
        },
      },
    );
  }

  openDetails(asset: Asset) {
    this.modalAndAlertService.openModal(JsonldViewerComponent, { jsonLdObject: asset });
  }

  private fetchAssets() {
    this.fetched = false;
    this.assets$ = this.filteredAssets$ = of([]);
    this.assets$ = this.filteredAssets$ = from(this.assetService.getAllAssets().finally(() => (this.fetched = true)));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
