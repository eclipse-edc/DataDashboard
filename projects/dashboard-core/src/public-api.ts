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

/*
 * Public API Surface of dashboard-core
 */

export * from './lib/services/dashboard-state.service';
export * from './lib/services/modal-and-alert.service';
export * from './lib/services/edc-client.service';
export * from './lib/services/data-type-registry.service';
export * from './lib/dashboard-app/dashboard-app.component';
export * from './lib/common/jsonld-viewer/jsonld-viewer.component';
export * from './lib/common/filter-input/filter-input.component';
export * from './lib/common/pagination/pagination.component';
export * from './lib/common/item-count-selector/item-count-selector.component';
export * from './lib/common/alert/alert.component';
export * from './lib/common/connector-config-form/connector-config-form.component';
export * from './lib/common/consumer-provider-switch/consumer-provider-switch.component';
export * from './lib/common/multiselect-with-search/multiselect-with-search.component';
export * from './lib/common/deletion-confirm/deletion-confirm.component';
export * from './lib/common/json-object-table/json-object-table.component';
export * from './lib/common/json-object-input/json-object-input.component';
export * from './lib/common/data-address/data-address-form/data-address-form.component';
export * from './lib/common/data-address/data-type-input/data-type-input.component';
export * from './lib/common/data-address/fallback-data-type/fallback-data-type.component';
export * from './lib/common/data-address/http-data-type/http-data-type.component';
export * from './lib/common/data-address/aws-s3-data-type/aws-s3-data-type.component';
export * from './lib/models/menu-item';
export * from './lib/models/app-config';
export * from './lib/models/edc-config';
export * from './lib/models/json-value';
export * from './lib/models/pair';
export * from './lib/models/constants';
