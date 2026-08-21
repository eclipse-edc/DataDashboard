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

import { Component, Input, OnChanges, inject } from '@angular/core';
import { JsonLdObject } from '@think-it-labs/edc-connector-client';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { EdcClientService } from '../../services/edc-client.service';

@Component({
  selector: 'lib-jsonld-viewer',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './jsonld-viewer.component.html',
  styleUrl: './jsonld-viewer.component.css',
})
export class JsonldViewerComponent implements OnChanges {
  @Input() jsonLdObject?: JsonLdObject;
  expanded = new BehaviorSubject<string[]>(['']);
  compacted = new BehaviorSubject<string[]>(['']);
  edcClientService = inject(EdcClientService);

  async ngOnChanges() {
    const expanded = JSON.stringify(this.jsonLdObject, null, 2).split('\n');
    const compacted = await this.edcClientService.compact(this.jsonLdObject);

    this.expanded.next(expanded);
    this.compacted.next(JSON.stringify(compacted, null, 2).split('\n'));
  }
}
