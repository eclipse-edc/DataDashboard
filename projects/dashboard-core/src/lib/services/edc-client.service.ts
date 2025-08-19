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

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, timeout } from 'rxjs';
import { EdcConnectorClient, EdcConnectorClientError } from '@think-it-labs/edc-connector-client';
import { EdcConfig } from '../models/edc-config';

@Injectable({
  providedIn: 'root',
})
export class EdcClientService implements OnDestroy {
  /**
   * Maximum time to wait (ms) for the EDC client service to return a client.
   * ToDo: config value?
   * @private
   */
  private readonly CLIENT_TIMEOUT: number = 1000;
  /**
   * Health check interval for the current edc client in seconds .
   * @private
   */
  private healthCheckInterval = 30;

  private readonly _client = new BehaviorSubject<EdcConnectorClient | undefined>(undefined);
  private readonly _isHealthy: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isHealthy$ = this._isHealthy.asObservable();

  private healthCheckJob?: ReturnType<typeof setInterval>;

  /**
   * Asynchronously retrieves the {@link EdcConnectorClient} instance.
   * Waits until a client is available or the operation times out ({@link CLIENT_TIMEOUT}).
   *
   * @returns A promise that resolves to the {@link EdcConnectorClient} instance.
   * @throws Error If no client is available within the specified timeout period.
   */
  public async getClient(): Promise<EdcConnectorClient> {
    return firstValueFrom(
      this._client.asObservable().pipe(
        filter(x => x !== undefined),
        timeout(this.CLIENT_TIMEOUT),
      ),
    ).catch(() => {
      throw new Error(`[${this.constructor.name}] An EDC client is requested, but no client was created yet.`);
    });
  }

  /**
   * Creates an instance of the {@link EdcConnectorClient} using the provided configuration.
   * This method initializes the client with the specified URLs and optional parameters.
   * Once the client is created, it updates the internal client subject.
   *
   * @param config - The configuration object containing URLs and optional parameters for the EDC client.
   * @param config.managementUrl - The management URL for the EDC client.
   * @param config.defaultUrl - The default URL for the EDC client.
   * @param config.protocolUrl - The protocol URL for the EDC client.
   * @param config.federatedCatalogEnabled - Whether this connector has an FC or not.
   * @param config.apiToken - (Optional) The API token for authentication.
   * @param config.controlUrl - (Optional) The control URL for the EDC client.
   * @param config.federatedCatalogUrl - (Optional) The federated catalog URL for the EDC client.
   */
  public setDashboardClient(config: EdcConfig): void {
    this._client.next(this.createEdcConnectorClient(config));
    this.startHealthCheckJob();

    console.debug(`[${this.constructor.name}] Client created for connector config: ${JSON.stringify(config)}`);
  }

  /**
   * Create a client WITHOUT setting it as the current dashboard client.
   * @param {EdcConfig} config
   * @private
   */
  public createEdcConnectorClient(config: EdcConfig): EdcConnectorClient {
    if (!config.protocolUrl || !config.managementUrl || !config.defaultUrl)
      throw new Error(
        `[${this.constructor.name}] EDC client creation failed. Missing protocolUrl, defaultUrl or managementUrl in config: ${JSON.stringify(
          config,
        )}`,
      );
    const connector = new EdcConnectorClient.Builder()
      .managementUrl(config.managementUrl)
      .defaultUrl(config.defaultUrl)
      .protocolUrl(config.protocolUrl);
    if (config.apiToken) connector.apiToken(config.apiToken);
    if (config.controlUrl) connector.controlUrl(config.controlUrl);
    if (config.federatedCatalogUrl) connector.federatedCatalogUrl(config.federatedCatalogUrl);
    return connector.build();
  }

  /**
   * Sets the interval for the health check process.
   *
   * @param {number} interval - The interval time in milliseconds to set for health checks.
   * @return {void} This method does not return a value.
   */
  public setHealthCheckInterval(interval: number): void {
    this.healthCheckInterval = interval;
    this.stopHealthCheckJob();
    this.startHealthCheckJob();
  }

  private runHealthCheck(edcConfig?: EdcConfig): void {
    if (this._client.getValue() || edcConfig) {
      const client = edcConfig ? this.createEdcConnectorClient(edcConfig) : this._client.getValue();
      client?.observability
        .checkHealth()
        .then(healthStatus => {
          if (client === this._client.getValue() && healthStatus.isSystemHealthy !== this._isHealthy.getValue()) {
            this._isHealthy.next(healthStatus.isSystemHealthy);
          }
        })
        .catch((e: EdcConnectorClientError) => {
          if (client === this._client.getValue()) {
            console.error(`[${this.constructor.name}] Health check failed: ${e.message}`);
            this._isHealthy.next(false);
          }
        });
    } else {
      console.warn(`[${this.constructor.name}] Health check requested with undefined edc client.`);
    }
  }

  private startHealthCheckJob(): void {
    this.stopHealthCheckJob();
    this._isHealthy.next(false);
    this.healthCheckJob = setInterval(this.runHealthCheck.bind(this), this.healthCheckInterval * 1000);
    this.runHealthCheck();
  }

  private stopHealthCheckJob(): void {
    if (this.healthCheckJob) {
      clearInterval(this.healthCheckJob);
      this.healthCheckJob = undefined;
    }
  }

  ngOnDestroy() {
    this._client.complete();
    this._isHealthy.complete();
    this.stopHealthCheckJob();
  }
}
