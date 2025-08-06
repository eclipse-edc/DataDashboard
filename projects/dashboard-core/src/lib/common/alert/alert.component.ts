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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-alert',
  imports: [NgClass],
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent implements OnDestroy, OnChanges {
  @Input() title? = '';
  @Input() msg = '';
  @Input() type?: AlertType;
  @Input() timeoutSeconds?: number;
  @Input() showTimer?: boolean;
  @Output() closeEvent = new EventEmitter<void>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private intervalId: any;
  private readonly updateInterval = 20;
  countdown!: number;

  ngOnChanges() {
    this.stopTimer();
    this.startTimer();
  }

  startTimer() {
    if (this.timeoutSeconds) {
      this.countdown = 100;
      const step = (this.updateInterval / (this.timeoutSeconds * 1000)) * 100;

      this.intervalId = setInterval(() => {
        this.countdown -= step;
        if (this.countdown <= 0) {
          this.countdown = 0;
          clearInterval(this.intervalId);
          this.closeEvent.emit();
        }
      }, this.updateInterval);
    }
  }

  stopTimer() {
    this.countdown = 0;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  close() {
    this.stopTimer();
    this.closeEvent.emit();
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}

export type AlertType = 'info' | 'warning' | 'error' | 'success';
