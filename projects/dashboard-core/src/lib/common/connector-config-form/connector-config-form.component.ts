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

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EdcClientService } from '../../services/edc-client.service';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { NgClass } from '@angular/common';
import { EdcConfig } from '../../models/edc-config';
import { EdcConnectorClient, HealthStatus } from '@think-it-labs/edc-connector-client';
import { AlertComponent } from '../alert/alert.component';
import { DID_WEB_REGEX, URL_REGEX } from '../../models/constants';

@Component({
  selector: 'lib-connector-config-form',
  templateUrl: './connector-config-form.component.html',
  imports: [ReactiveFormsModule, NgClass, AlertComponent],
})
export class ConnectorConfigFormComponent {
  private readonly edc = inject(EdcClientService);
  private readonly stateService = inject(DashboardStateService);

  @Output() created = new EventEmitter<void>();

  connectorForm: FormGroup = new FormGroup({
    connectorName: new FormControl('', Validators.required),
    managementUrl: new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
    managementApiVersion: new FormControl('v4', [Validators.required]),
    protocolUrl: new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
    protocolVersion: new FormControl('2025-01', [Validators.required]),
    defaultUrl: new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
    apiToken: new FormControl(''),
    authHeaderKey: new FormControl(''),
    authHeaderValue: new FormControl(''),
    federatedCatalogEnabled: new FormControl(false),
    identityHubEnabled: new FormControl(false),
  });

  fcEnabled = false;
  ihEnabled = false;
  loading = false;
  errorMsg = '';

  onFederatedCatalogToggle() {
    this.fcEnabled = !this.fcEnabled;
    if (this.fcEnabled) {
      this.connectorForm.addControl(
        'federatedCatalogUrl',
        new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
      );
    } else {
      this.connectorForm.removeControl('federatedCatalogUrl');
    }
  }

  onIdentityHubToggle() {
    this.ihEnabled = !this.ihEnabled;
    if (this.ihEnabled) {
      this.connectorForm.addControl('did', new FormControl('', [Validators.required, Validators.pattern(DID_WEB_REGEX)]));
      this.connectorForm.addControl(
        'identityUrl',
        new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
      );
      this.connectorForm.addControl('identityApiVersion', new FormControl('v1beta', [Validators.required]));
      this.connectorForm.addControl(
        'presentationUrl',
        new FormControl('', [Validators.required, Validators.pattern(URL_REGEX)]),
      );
    } else {
      this.connectorForm.removeControl('did');
      this.connectorForm.removeControl('identityUrl');
      this.connectorForm.removeControl('identityApiVersion');
      this.connectorForm.removeControl('presentationUrl');
    }
  }

  async addConnector() {
    const edcConfig: EdcConfig = {
      connectorName: this.connectorForm.value.connectorName,
      managementUrl: this.connectorForm.value.managementUrl,
      managementApiVersion: this.connectorForm.value.managementApiVersion,
      defaultUrl: this.connectorForm.value.defaultUrl,
      protocolUrl: this.connectorForm.value.protocolUrl,
      protocolVersion: this.connectorForm.value.protocolVersion,
    };
    if (this.connectorForm.value.apiToken) {
      edcConfig.apiToken = this.connectorForm.value.apiToken;
    }
    if (this.connectorForm.value.authHeaderKey && this.connectorForm.value.authHeaderValue) {
      edcConfig.authorization = {
        key: this.connectorForm.value.authHeaderKey,
        value: this.connectorForm.value.authHeaderValue,
      };
    }
    if (this.connectorForm.value.federatedCatalogEnabled) {
      edcConfig.federatedCatalogUrl = this.connectorForm.value.federatedCatalogUrl;
    }
    if (this.connectorForm.value.identityHubEnabled) {
      edcConfig.did = this.connectorForm.value.did;
      edcConfig.identityUrl = this.connectorForm.value.identityUrl;
      edcConfig.identityApiVersion = this.connectorForm.value.identityApiVersion;
      edcConfig.presentationUrl = this.connectorForm.value.presentationUrl;
    }

    const client: EdcConnectorClient = this.edc.createEdcConnectorClient(edcConfig);
    this.loading = true;
    try {
      const status: HealthStatus = await client.observability.checkHealth();
      if (status.isSystemHealthy) {
        this.stateService.addLocalStorageEdcConfig(edcConfig);
        this.created.emit();
      } else {
        this.errorMsg = 'The connector is unhealthy.';
      }
    } catch (error) {
      if (error instanceof TypeError) {
        this.errorMsg = error.message;
      } else {
        this.errorMsg = `Could not reach the default API '${edcConfig.defaultUrl}'. Please check your inputs.`;
      }
    } finally {
      this.loading = false;
    }
  }
}
