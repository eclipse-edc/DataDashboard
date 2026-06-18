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

import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [ReactiveFormsModule, AlertComponent, NgClass],
  templateUrl: './policy-create.component.html',
  styleUrl: './policy-create.component.css',
})
export class PolicyCreateComponent implements OnChanges {
  private readonly policyService = inject(PolicyService);
  private readonly formBuilder = inject(FormBuilder);

  @Input() policyDefinition?: PolicyDefinition;

  @Output() created = new EventEmitter<IdResponse>();
  @Output() updated = new EventEmitter<void>();
  mode: 'create' | 'update' = 'create';

  errorMsg = '';

  policyForm: FormGroup;

  constructor() {
    this.policyForm = this.formBuilder.group({
      id: [''],
      policyType: new FormControl<PolicyType | undefined>(undefined, {
        validators: [Validators.required],
      }),
      permissionsJson: [''],
      prohibitionsJson: [''],
      obligationsJson: [''],
    });
  }

  async ngOnChanges() {
    if (!this.policyDefinition) {
      return;
    }
    this.mode = 'update';

    const { policy } = this.policyDefinition;
    const compactPolicy = await compact(policy);
    const typeSegments = compactPolicy['@type'].split('/');

    this.policyForm.patchValue({
      id: this.policyDefinition['@id'],
      policyType: typeSegments[typeSegments.length - 1] as PolicyType,
      permissionsJson: await this.rulesToJson(policy.permissions),
      prohibitionsJson: await this.rulesToJson(policy.prohibitions),
      obligationsJson: await this.rulesToJson(policy.obligations),
    });
  }

  createPolicyDefinition(): void {
    this.submit(input => this.policyService.createPolicyDefinition(input).then(res => this.created.emit(res)));
  }

  editPolicyDefinition(): void {
    this.submit(input => this.policyService.updatePolicy(input.id!, input).then(() => this.updated.emit()));
  }

  /** Validates the form, builds the input and runs the given action, funnelling all errors to `errorMsg`. */
  private submit(action: (input: PolicyDefinitionInput) => Promise<unknown>): void {
    if (!this.policyForm.valid) {
      console.error('Policy form submitted while invalid');
      return;
    }

    let policyInput: PolicyDefinitionInput;
    try {
      policyInput = this.createPolicyInput();
    } catch (err: unknown) {
      this.errorMsg = this.toErrorMessage(err, 'An unknown error occurred.');
      return;
    }

    action(policyInput).catch((err: EdcConnectorClientError) => {
      this.errorMsg = err.message;
    });
  }

  private createPolicyInput(): PolicyDefinitionInput {
    const { id, policyType, permissionsJson, prohibitionsJson, obligationsJson } = this.policyForm.value;

    const policyInput: PolicyInput = { '@type': policyType };
    this.assignJsonRule(policyInput, 'permission', permissionsJson, 'Permissions');
    this.assignJsonRule(policyInput, 'prohibition', prohibitionsJson, 'Prohibitions');
    this.assignJsonRule(policyInput, 'obligation', obligationsJson, 'Obligations');

    const policy = new PolicyBuilder()
      .type(policyType ?? ('Set' as PolicyType))
      .raw(policyInput)
      .build();

    const policyDefinitionInput: PolicyDefinitionInput = { policy };
    if (id) {
      policyDefinitionInput.id = id;
      policyDefinitionInput['@id'] = id;
    }

    return policyDefinitionInput;
  }

  /** Compacts a list of rules to a JSON string, or returns an empty string when there are none. */
  private async rulesToJson(rules: unknown[]): Promise<string> {
    return rules.length > 0 ? JSON.stringify(await compact(rules)) : '';
  }

  /** Parses a JSON rule field and assigns it to the policy input, throwing a labelled error on failure. */
  private assignJsonRule(
    target: PolicyInput,
    key: 'permission' | 'prohibition' | 'obligation',
    value: string,
    label: string,
  ): void {
    if (!value) {
      return;
    }
    try {
      target[key] = JSON.parse(value);
    } catch (err: unknown) {
      throw new Error(`Invalid JSON for ${label}: ${this.toErrorMessage(err, 'parsing failed')}`, { cause: err });
    }
  }

  private toErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
  }
}
