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

import { Component, OnInit } from '@angular/core';
import { DashboardAppComponent, EdcConfig } from '@eclipse-edc/dashboard-core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../projects/dashboard-core/src/lib/models/app-config';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [DashboardAppComponent],
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  protected readonly themes = [
    'light',
    'dark',
    'dim',
    'aqua',
    'nord',
    'synthwave',
    'forest',
    'dracula',
    'night',
    'coffee',
    'emerald',
  ];
  edcConfigs?: Promise<EdcConfig[]>;
  appConfig?: Promise<AppConfig>;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.edcConfigs = firstValueFrom(this.http.get<EdcConfig[]>('config/edc-connector-config.json'));
    this.appConfig = firstValueFrom(this.http.get<AppConfig>('config/app-config.json'));
  }
}
