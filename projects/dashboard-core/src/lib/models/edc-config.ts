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

import { EdcController } from '@think-it-labs/edc-connector-client';

export interface EdcConfig {
  connectorName: string;
  managementUrl: string;
  managementApiVersion: string;
  defaultUrl: string;
  protocolUrl: string;
  protocolVersion?: string;
  /**
   * Identity API base URL. Only required when the connector exposes an Identity Hub.
   */
  identityUrl?: string;
  identityApiVersion?: string;
  /**
   * Presentation API base URL. Only required when the connector exposes an Identity Hub.
   */
  presentationUrl?: string;
  /**
   * @deprecated use {@link authorization} instead
   */
  apiToken?: string;
  authorization?: {
    key: string;
    value: string;
  };
  federatedCatalogUrl?: string;
  did?: string;
  /**
   * Optional custom health check. Resolves true = healthy, false = unhealthy.
   * When set, this runs instead of the native observability.checkHealth().
   */
  customHealthCheck?: () => Promise<boolean>;
  /**
   * Optional extra custom controllers for EDC connectors with more/custom controllers.
   * They are added to EdcConnectorClient via the 'use()' function.
   */
  customControllers?: Record<string, typeof EdcController>;
}
