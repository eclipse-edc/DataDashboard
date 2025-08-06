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

import { Component } from '@angular/core';
import { DashboardStateService } from '@eclipse-edc/dashboard-core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-home-view',
  imports: [AsyncPipe],
  templateUrl: './home-view.component.html',
})
export class HomeViewComponent {
  constructor(
    public readonly stateService: DashboardStateService,
    private readonly router: Router,
  ) {}

  async navigate(path: string) {
    await this.router.navigate([path]);
  }
}
