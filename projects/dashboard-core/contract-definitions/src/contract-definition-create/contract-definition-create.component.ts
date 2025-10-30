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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Asset,
  ContractDefinition,
  ContractDefinitionInput,
  CriterionInput,
  EdcConnectorClientError,
  IdResponse,
  PolicyDefinition,
} from '@think-it-labs/edc-connector-client';
import { ContractDefinitionsService } from '../contract-definitions.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertComponent, ModalAndAlertService, MultiselectWithSearchComponent } from '@eclipse-edc/dashboard-core';
import { AssetService } from '@eclipse-edc/dashboard-core/assets';
import { from, map, Observable, of } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'lib-contract-definition-create',
  imports: [
    FormsModule,
    MultiselectWithSearchComponent,
    AlertComponent,
    MultiselectWithSearchComponent,
    ReactiveFormsModule,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './contract-definition-create.component.html',
  styleUrl: './contract-definition-create.component.css',
  standalone: true,
})
export class ContractDefinitionCreateComponent implements OnInit, OnChanges {
  private readonly router = inject(Router);
  private readonly contractDefinitionService = inject(ContractDefinitionsService);
  assetService = inject(AssetService);
  protected readonly formBuilder = inject(FormBuilder);
  private readonly modalAndAlertService = inject(ModalAndAlertService);

  @ViewChild('assetsSelector', { static: false }) searchChild!: MultiselectWithSearchComponent<string>;

  @Input() contractDefinitionInput?: ContractDefinition;
  @Output() createdEvent = new EventEmitter<IdResponse>();
  @Output() editedEvent = new EventEmitter<void>();

  contractDefinitionForm: FormGroup;

  contractDefinitionId: string | undefined = '';
  accessPolicyId: string | undefined = '';
  contractPolicyId: string | undefined = '';
  assetInput: string[] = [];

  assets$: Observable<Asset[]> = of([]);
  assetIds$: Observable<string[]> = of([]);
  policyDefinitions$: Observable<PolicyDefinition[]> = of([]);

  errorMsg = '';

  constructor() {
    this.contractDefinitionForm = this.formBuilder.group({
      id: [''],
      accessPolicyId: new FormControl(undefined, {
        validators: [Validators.required],
      }),
      contractPolicyId: new FormControl(undefined, {
        validators: [Validators.required],
      }),
      assetsSelector: [''],
    });
  }

  async ngOnInit() {
    this.assets$ = from(this.assetService.getAllAssets());
    this.policyDefinitions$ = from(this.contractDefinitionService.getAllPolicies());
    this.assetIds$ = this.assets$.pipe(
      map(assets => {
        return assets.map(asset => asset.id);
      }),
    );
  }

  ngOnChanges(): void {
    if (this.contractDefinitionInput) {
      this.contractDefinitionId = this.contractDefinitionInput?.id;
      this.contractPolicyId = this.contractDefinitionInput?.contractPolicyId;
      this.accessPolicyId = this.contractDefinitionInput?.accessPolicyId;
      this.assetInput = this.contractDefinitionInput?.assetsSelector
        .filter(x => x.operandLeft == 'id')
        .map(x => x.operandRight);
      this.syncForm();
    }
  }

  private syncForm() {
    if (this.contractDefinitionInput?.id !== undefined) {
      this.contractDefinitionForm.get('id')?.setValue(this.contractDefinitionInput.id);
      this.contractDefinitionForm.get('id')?.disable();
    }
    this.contractDefinitionForm.get('accessPolicyId')?.setValue(this.accessPolicyId);
    this.contractDefinitionForm.get('contractPolicyId')?.setValue(this.contractPolicyId);
  }

  async createPolicy() {
    this.modalAndAlertService.closeModal();
    await this.router.navigate(['/policies']);
  }

  handleSelectionChange(selectedAssets: string[]) {
    this.assetInput = selectedAssets;
  }

  updateContractDefinition(): void {
    const contractDefinitionInput: ContractDefinitionInput = this.createContractDefinitionInput();
    this.contractDefinitionService
      .updateContractDefinition(contractDefinitionInput)
      .then(() => {
        this.editedEvent.emit();
      })
      .catch((err: EdcConnectorClientError) => {
        this.errorMsg = err.message;
      });
  }

  createContractDefinition(): void {
    if (this.contractDefinitionForm.valid) {
      const contractDefinitionInput: ContractDefinitionInput = this.createContractDefinitionInput();
      this.contractDefinitionService
        .createContractDefinition(contractDefinitionInput)
        .then((idResponse: IdResponse) => {
          this.createdEvent.emit(idResponse);
        })
        .catch((err: EdcConnectorClientError) => {
          this.errorMsg = err.message;
        });
    } else {
      console.error('Create contract definition called with invalid form');
    }
  }

  private createContractDefinitionInput(): ContractDefinitionInput {
    const assetsSelector: CriterionInput[] = [];
    this.assetInput.forEach((asset: string) => {
      assetsSelector.push({ operandLeft: 'id', operandRight: asset, operator: '=' });
    });

    const contractDefinition: ContractDefinitionInput = {
      accessPolicyId: this.accessPolicyId!,
      contractPolicyId: this.contractPolicyId!,
      assetsSelector: assetsSelector,
    };
    if (this.contractDefinitionForm.value.id) {
      contractDefinition['@id'] = this.contractDefinitionForm.value.id;
    } else if (this.contractDefinitionId) {
      contractDefinition['@id'] = this.contractDefinitionId;
    }
    if (this.contractDefinitionForm.value.accessPolicyId) {
      contractDefinition.accessPolicyId = this.contractDefinitionForm.value.accessPolicyId;
    }
    if (this.contractDefinitionForm.value.contractPolicyId) {
      contractDefinition.contractPolicyId = this.contractDefinitionForm.value.contractPolicyId;
    }
    if (this.contractDefinitionForm.value.assetsSelector) {
      contractDefinition.assetsSelector = this.contractDefinitionForm.value.assetsSelector;
    }
    return contractDefinition;
  }
}
