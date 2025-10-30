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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CatalogDataset } from '../catalog-dataset';

@Component({
  selector: 'lib-catalog-card',
  standalone: true,
  imports: [],
  templateUrl: './catalog-card.component.html',
  styleUrl: './catalog-card.component.css',
})
export class CatalogCardComponent implements OnInit {
  @Input() catalogDataset?: CatalogDataset;
  @Input() showButtons = true;

  @Output() detailsEvent = new EventEmitter<CatalogDataset>();
  @Output() negotiateEvent = new EventEmitter<CatalogDataset>();

  name?: string;
  version?: string;
  contentType?: string;
  participantId?: string;

  ngOnInit() {
    this.name = this.catalogDataset?.assetId;
    this.version = this.catalogDataset?.dataset?.['asset:prop:version']?.[0]?.['@value'];
    this.contentType = this.catalogDataset?.dataset.mandatoryValue('edc', 'contenttype');
    this.participantId = this.catalogDataset?.participantId;
  }
}
