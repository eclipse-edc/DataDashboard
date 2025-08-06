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

import { Dataset } from '@think-it-labs/edc-connector-client';
import { Policy } from '@think-it-labs/edc-connector-client/dist/src/entities/policy';

export interface CatalogDataset {
  id: string;
  participantId: string;
  assetId: string;
  dataset: Dataset;
  offers: Map<string, Policy>;
  originator: string;
}
