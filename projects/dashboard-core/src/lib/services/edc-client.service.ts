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
import { EdcConnectorClient, EdcConnectorClientError, JsonLdService } from '@think-it-labs/edc-connector-client';
import { JsonValue } from '@angular-devkit/core';
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

  private currentConfig?: EdcConfig;

  private readonly _client = new BehaviorSubject<EdcConnectorClient | undefined>(undefined);
  private readonly _isHealthy: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isHealthy$ = this._isHealthy.asObservable();

  /**
   * Lazily created {@link JsonLdService} bound to the current client and its cached
   * JSON-LD contexts. Invalidated whenever the active client changes.
   * @private
   */
  private jsonLdService?: { client: EdcConnectorClient; service: JsonLdService };

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
   * @param config.apiToken - (Optional) The API token for authentication.
   * @param config.federatedCatalogUrl - (Optional) The federated catalog URL for the EDC client.
   */
  public setDashboardClient(config: EdcConfig): void {
    this.currentConfig = config;
    this._client.next(this.createEdcConnectorClient(config));
    this.startHealthCheckJob();

    console.debug(`[${this.constructor.name}] Client created for connector config: ${JSON.stringify(config)}`);
  }

  /**
   * Create a client WITHOUT setting it as the current dashboard client.
   *
   * @param config - The configuration object containing URLs and optional parameters for the EDC client.
   * @param config.managementUrl - The management URL for the EDC client.
   * @param config.managementApiVersion - The management API version (e.g. `v4`).
   * @param config.defaultUrl - The default URL for the EDC client.
   * @param config.protocolUrl - The protocol (DSP) URL for the EDC client.
   * @param config.protocolVersion - (Optional) The dataspace protocol version.
   * @param config.identityUrl - (Optional) The identity API URL (Identity Hub).
   * @param config.identityApiVersion - (Optional) The identity API version.
   * @param config.presentationUrl - (Optional) The presentation API URL (Identity Hub).
   * @param config.apiToken - (Optional, deprecated) The API token for authentication.
   * @param config.authorization - (Optional) A custom authorization header key/value pair.
   * @param config.federatedCatalogUrl - (Optional) The federated catalog URL for the EDC client.
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
    if (config.managementApiVersion) connector.managementApiVersion(config.managementApiVersion);
    if (config.protocolVersion) connector.protocolVersion(config.protocolVersion);
    if (config.identityUrl) connector.identityUrl(config.identityUrl);
    if (config.identityApiVersion) connector.identityApiVersion(config.identityApiVersion);
    if (config.presentationUrl) connector.presentationUrl(config.presentationUrl);
    if (config.apiToken) connector.apiToken(config.apiToken);
    if (config.authorization) connector.authorization(config.authorization.key, config.authorization.value);
    return connector.build();
  }

  /**
   * Compacts a JSON-LD object using the JSON-LD contexts cached by the current client.
   *
   * Centralizes JSON-LD handling so consumers do not need to instantiate a
   * {@link JsonLdService} themselves. The underlying service is cached and only
   * recreated when the active client changes.
   *
   * @param body - The (expanded) JSON-LD object to compact.
   * @returns A promise resolving to the compacted representation.
   */
  public async compact<T = Record<string, JsonValue>>(body: unknown): Promise<T> {
    const client = await this.getClient();
    if (this.jsonLdService?.client !== client) {
      this.jsonLdService = {
        client,
        service: new JsonLdService(client.context.cachedJsonLdContexts),
      };
    }
    const compacted = await this.jsonLdService.service.compact(body);
    return compacted as T;
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
    const config = edcConfig ?? this.currentConfig;

    // A custom health check takes precedence over the native one.
    if (config?.customHealthCheck) {
      config
        .customHealthCheck()
        .then(isHealthy => {
          if (config === this.currentConfig && isHealthy !== this._isHealthy.getValue()) {
            this._isHealthy.next(isHealthy);
          }
        })
        .catch((e: unknown) => {
          if (config === this.currentConfig) {
            console.error(`[${this.constructor.name}] Custom health check failed: ${(e as Error)?.message}`);
            this._isHealthy.next(false);
          }
        });
    } else if (this._client.getValue() || edcConfig) {
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
    this.currentConfig = undefined;
    this.jsonLdService = undefined;
  }
}
