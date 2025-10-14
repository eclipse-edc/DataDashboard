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

import { AfterViewInit, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass, NgForOf } from '@angular/common';
import { DashboardStateService } from '../services/dashboard-state.service';
import { EdcConfig } from '../models/edc-config';
import { EdcClientService } from '../services/edc-client.service';
import { ModalAndAlertService } from '../services/modal-and-alert.service';
import { DeleteConfirmComponent } from '../common/deletion-confirm/deletion-confirm.component';
import { ConnectorConfigFormComponent } from '../common/connector-config-form/connector-config-form.component';
import { AppConfig } from '../models/app-config';

@Component({
  selector: 'lib-dashboard-app',
  standalone: true,
  imports: [RouterOutlet, NgForOf, RouterLink, RouterLinkActive, AsyncPipe, NgClass],
  templateUrl: './dashboard-app.component.html',
  styleUrl: './dashboard-app.component.css',
})
export class DashboardAppComponent implements AfterViewInit {
  @Input() appConfig?: Promise<AppConfig>;
  @Input() edcConfigs?: Promise<EdcConfig[]>;
  @Input() themes: string[] = [];

  @ViewChild('dashboardModal', { read: ViewContainerRef, static: true }) modal!: ViewContainerRef;
  @ViewChild('dashboardAlert', { read: ViewContainerRef, static: true }) alert!: ViewContainerRef;

  constructor(
    public stateService: DashboardStateService,
    public readonly edcClientService: EdcClientService,
    private readonly modalAndAlertService: ModalAndAlertService,
  ) {}

  async ngAfterViewInit() {
    const dialog = document.querySelector<HTMLDialogElement>('#dashboard-dialog');
    this.modalAndAlertService.setDialogToInject(dialog!, this.modal);
    this.modalAndAlertService.setAlertToInject(this.alert);

    const appConfig = this.appConfig ? await this.appConfig : undefined;
    if (!appConfig?.menuItems) {
      this.modalAndAlertService.showAlert(
        'Missing app configuration! Menu items must be set!',
        'Configuration error',
        'error',
      );
      return;
    } else {
      this.stateService.setAppConfig(appConfig);
    }

    const configs = this.edcConfigs ? await this.edcConfigs : undefined;
    if (!configs || configs.length === 0) {
      return;
    }
    const firstConfig: EdcConfig = configs[0];

    try {
      this.stateService.setFederatedCatalogEnabled(firstConfig.federatedCatalogEnabled);
      this.stateService.setEdcConfigs(configs);
    } catch (e) {
      console.error(e);
      this.modalAndAlertService.showAlert((e as Error).message, 'Configuration error', 'error');
    }
  }

  selectConnector(edcConfig: EdcConfig) {
    this.stateService.setCurrentEdcConfig(edcConfig);
    (document.activeElement as HTMLElement)?.blur();
  }

  addConnector() {
    this.modalAndAlertService.openModal(ConnectorConfigFormComponent, undefined, {
      created: () => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert('EDC connector added successfully', 'Connector Added', 'success', 5);
      },
    });
  }

  deleteConnector(edcConfig: EdcConfig) {
    this.modalAndAlertService.openModal(
      DeleteConfirmComponent,
      {
        customText: `Are you sure you want to delete the configuration for connector "${edcConfig.connectorName}"?`,
      },
      {
        confirm: () => {
          this.stateService.deleteLocalStorageEdcConfig(edcConfig);
          this.modalAndAlertService.closeModal();
        },
        canceled: () => this.modalAndAlertService.closeModal(),
      },
    );
  }
}
