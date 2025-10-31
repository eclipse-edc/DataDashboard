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

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-json-object-table',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './json-object-table.component.html',
  styleUrl: './json-object-table.component.css',
})
export class JsonObjectTableComponent implements OnChanges {
  @Input() object!: Record<string, JsonValue>;
  @Input() excludeKeys: string[] = [];
  @Input() deleteButton = false;
  @Output() delete = new EventEmitter<string>();

  keys: string[] = [];

  ngOnChanges() {
    this.keys = Object.keys(this.object).filter(key => !this.excludeKeys.includes(key));
  }
}
