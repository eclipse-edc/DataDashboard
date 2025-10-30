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

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { PolicyService } from '../policy.service';
import { AlertComponent } from '@eclipse-edc/dashboard-core';
import { PolicyType } from '@think-it-labs/edc-connector-client/dist/src/entities/policy/policy';
import {
  compact,
  EdcConnectorClientError,
  IdResponse,
  PolicyBuilder,
  PolicyDefinition,
  PolicyDefinitionInput,
  PolicyInput,
} from '@think-it-labs/edc-connector-client';

@Component({
  selector: 'lib-policy-create',
  standalone: true,
  imports: [FormsModule, AlertComponent, NgClass],
  templateUrl: './policy-create.component.html',
  styleUrl: './policy-create.component.css',
})
export class PolicyCreateComponent implements OnChanges {
  protected readonly Object = Object;

  @Input() policyDefinition?: PolicyDefinition;

  @Output() created = new EventEmitter<IdResponse>();
  @Output() updated = new EventEmitter<void>();
  mode: 'create' | 'update' = 'create';

  errorMsg = '';

  id = '';
  policyType?: PolicyType;
  permissionsJson = '';
  prohibitionsJson = '';
  obligationsJson = '';

  policyForm: FormGroup;

  constructor(
    private readonly policyService: PolicyService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.policyForm = this.formBuilder.group({
      id: [''],
      policyType: [''],
    });
  }

  async ngOnChanges() {
    if (this.policyDefinition) {
      const compactPolicy = await compact(this.policyDefinition.policy);
      this.mode = 'update';
      this.id = this.policyDefinition['@id'];

      const typeSplit: string[] = compactPolicy['@type'].split('/');
      this.policyType = typeSplit[typeSplit.length - 1] as PolicyType;
      if (this.policyDefinition.policy.permissions.length > 0) {
        this.permissionsJson = JSON.stringify(await compact(this.policyDefinition.policy.permissions));
      }
      if (this.policyDefinition.policy.prohibitions.length > 0) {
        this.prohibitionsJson = JSON.stringify(await compact(this.policyDefinition.policy.prohibitions));
      }

      if (this.policyDefinition.policy.obligations.length > 0) {
        this.obligationsJson = JSON.stringify(await compact(this.policyDefinition.policy.obligations));
      }
    }
  }

  createPolicyDefinition(): void {
    try {
      const policyInput: PolicyDefinitionInput = this.createPolicyInput();
      this.policyService
        .createPolicyDefinition(policyInput)
        .then((idResponse: IdResponse) => {
          this.created.emit(idResponse);
        })
        .catch((err: EdcConnectorClientError) => {
          this.errorMsg = err.message;
        });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMsg = err.message; // Use the error message from the thrown error
      } else {
        this.errorMsg = 'An unknown error occurred.';
      }
    }
  }

  editPolicyDefinition(): void {
    try {
      const policyInput: PolicyDefinitionInput = this.createPolicyInput();
      this.policyService
        .updatePolicy(policyInput.id!, policyInput)
        .then(() => this.updated.emit())
        .catch((err: EdcConnectorClientError) => {
          this.errorMsg = err.message;
        });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMsg = err.message; // Use the error message from the thrown error
      } else {
        this.errorMsg = 'An unknown error occurred.';
      }
    }
  }

  private createPolicyInput(): PolicyDefinitionInput {
    const policyInput: PolicyInput = {
      '@type': this.policyType,
    };

    // Individual JSON parsing with separate error handling
    try {
      if (this.permissionsJson && this.permissionsJson !== '') {
        policyInput.permission = JSON.parse(this.permissionsJson);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`Invalid JSON for permissions: ${err.message}`);
      } else {
        throw new Error('An unknown error occurred during permissions JSON parsing.');
      }
    }

    try {
      if (this.prohibitionsJson && this.prohibitionsJson !== '') {
        policyInput.prohibition = JSON.parse(this.prohibitionsJson);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`Invalid JSON for prohibitions: ${err.message}`);
      } else {
        throw new Error('An unknown error occurred during prohibitions JSON parsing.');
      }
    }

    try {
      if (this.obligationsJson && this.obligationsJson !== '') {
        policyInput.obligation = JSON.parse(this.obligationsJson);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`Invalid JSON for obligations: ${err.message}`);
      } else {
        throw new Error('An unknown error occurred during obligations JSON parsing.');
      }
    }

    let policy;
    if (this.policyType) {
      policy = new PolicyBuilder().type(this.policyType).raw(policyInput).build();
    } else {
      policy = new PolicyBuilder()
        .type('Set' as PolicyType)
        .raw(policyInput)
        .build();
    }

    const policyDefinitionInput: PolicyDefinitionInput = {
      policy: policy,
    };

    if (this.id) {
      policyDefinitionInput.id = this.id;
      policyDefinitionInput['@id'] = this.id;
    }

    return policyDefinitionInput;
  }
}
