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
import { AsyncPipe } from '@angular/common';
import { from, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { ContractDefinition, IdResponse } from '@think-it-labs/edc-connector-client';
import { ContractDefinitionsService } from '../../../contract-definitions';
import {
  DashboardStateService,
  DeleteConfirmComponent,
  FilterInputComponent,
  ItemCountSelectorComponent,
  JsonldViewerComponent,
  ModalAndAlertService,
  PaginationComponent,
} from '@eclipse-edc/dashboard-core';
import { ContractDefinitionCreateComponent } from '../contract-definition-create/contract-definition-create.component';
import { ContractDefinitionCardComponent } from '../contract-definition-card/contract-definition-card.component';

@Component({
  selector: 'lib-contract-definitions-view',
  imports: [
    AsyncPipe,
    PaginationComponent,
    FilterInputComponent,
    ContractDefinitionCardComponent,
    ItemCountSelectorComponent,
  ],
  templateUrl: './contract-definitions-view.component.html',
  styleUrl: './contract-definitions-view.component.css',
  standalone: true,
})
export class ContractDefinitionsViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  contractDefinitions$: Observable<ContractDefinition[]> = of([]);
  filteredContractDefinitions$: Observable<ContractDefinition[]> = of([]);
  pageContractDefinitions$: Observable<ContractDefinition[]> = of([]);
  fetched = false;
  pageItemCount = 15;

  constructor(
    public contractDefinitionsService: ContractDefinitionsService,
    private readonly modalAndAlertService: ModalAndAlertService,
    private readonly stateService: DashboardStateService,
  ) {
    this.stateService.currentEdcConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.fetchContractDefinitions.bind(this));
  }

  async ngOnInit() {
    this.fetchContractDefinitions();
  }

  fetchContractDefinitions() {
    this.fetched = false;
    this.contractDefinitions$ = this.filteredContractDefinitions$ = of([]);
    this.contractDefinitions$ = this.filteredContractDefinitions$ = from(
      this.contractDefinitionsService.getAllContractDefinitions().finally(() => (this.fetched = true)),
    );
  }

  filter(searchText: string) {
    if (searchText) {
      this.filteredContractDefinitions$ = this.contractDefinitions$.pipe(
        map(contractDefinitions =>
          contractDefinitions.filter(
            contractDefinition =>
              contractDefinition.id.includes(searchText) ||
              contractDefinition.accessPolicyId.includes(searchText) ||
              contractDefinition.contractPolicyId.includes(searchText),
          ),
        ),
      );
    } else {
      this.filteredContractDefinitions$ = this.contractDefinitions$;
    }
  }

  paginationEvent(pageItems: ContractDefinition[]) {
    this.pageContractDefinitions$ = of(pageItems);
  }

  openDetails(contractDefinition: ContractDefinition) {
    this.modalAndAlertService?.openModal(JsonldViewerComponent, { jsonLdObject: contractDefinition });
  }

  createContractDefinition() {
    const callbacks = {
      createdEvent: (id: IdResponse) => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(
          `Contract Definition with ID '${id.id}'`,
          'Created Successfully',
          'success',
          5,
        );
        this.fetchContractDefinitions();
      },
    };
    this.modalAndAlertService.openModal(ContractDefinitionCreateComponent, undefined, callbacks);
  }

  editContractDefinition(contractDefinition: ContractDefinition) {
    const callbacks = {
      editedEvent: () => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(
          `Contract Definition with ID '${contractDefinition.id}'`,
          'Updated Successfully',
          'success',
          5,
        );
        this.fetchContractDefinitions();
      },
    };
    this.modalAndAlertService.openModal(
      ContractDefinitionCreateComponent,
      { contractDefinitionInput: contractDefinition },
      callbacks,
    );
  }

  deleteContractDefinition(contractDefinition: ContractDefinition) {
    this.modalAndAlertService.openModal(
      DeleteConfirmComponent,
      {
        customText: 'Do you really want to delete this Contract Definition?',
        componentType: ContractDefinitionCardComponent,
        componentInputs: {
          showButtons: false,
          contractDefinition: contractDefinition,
        },
      },
      {
        canceled: () => this.modalAndAlertService.closeModal(),
        confirm: () => {
          this.modalAndAlertService.closeModal();
          this.contractDefinitionsService
            .deleteContractDefinition(contractDefinition)
            .then(() => {
              const msg = `Contract definition '${contractDefinition.id}' deleted successfully`;
              this.modalAndAlertService.showAlert(msg, undefined, 'success', 5);
              this.fetchContractDefinitions();
            })
            .catch(error => {
              console.error(error);
              const msg = `Deletion of contract definition '${contractDefinition.id}' failed`;
              this.modalAndAlertService.showAlert(msg, undefined, 'error', 5);
            });
        },
      },
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
