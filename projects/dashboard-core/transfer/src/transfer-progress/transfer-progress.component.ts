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

import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import {
  compact,
  ContractAgreement,
  ContractNegotiation,
  IdResponse,
  TransferProcess,
  TransferProcessStates,
} from '@think-it-labs/edc-connector-client';
import { ContractAndTransferService } from '../contract-and-transfer.service';
import { NgClass } from '@angular/common';
import { TransferPullDownloadComponent } from '../transfer-pull-download/transfer-pull-download.component';

@Component({
  selector: 'lib-transfer-progress',
  templateUrl: './transfer-progress.component.html',
  styleUrl: './transfer-progress.component.css',
  imports: [NgClass, TransferPullDownloadComponent],
})
export class TransferProgressComponent implements OnChanges, OnDestroy {
  @Input() agreement!: ContractAgreement;
  @Input() negotiation!: ContractNegotiation;
  @Input() transferId!: IdResponse;
  @Input() pullIntervalMs = 500;

  polling = true;
  process?: TransferProcess;
  type?: 'Push' | 'Pull';
  currentState?: TransferProcessStates;
  stateHistory: TransferProcessStates[] = [];
  happyPathStates: TransferProcessStates[] = [
    TransferProcessStates.INITIAL,
    TransferProcessStates.PROVISIONED,
    TransferProcessStates.REQUESTED,
    TransferProcessStates.STARTED,
    TransferProcessStates.COMPLETED,
  ];
  happyPath = true;
  exceptionStates: TransferProcessStates[] = [
    TransferProcessStates.SUSPENDED,
    TransferProcessStates.TERMINATED,
    TransferProcessStates.DEPROVISIONED,
  ];

  errorMsg?: string;

  private statusJob?: ReturnType<typeof setInterval>;

  constructor(private readonly transferService: ContractAndTransferService) {}

  async ngOnChanges() {
    if (this.transferId.id) {
      this.process = await compact(await this.transferService.getTransferProcess(this.transferId.id));
      if (this.process) {
        this.type = this.process['transferType']?.toLowerCase().includes('push') ? 'Push' : 'Pull';
        if (this.type === 'Pull') {
          if (this.happyPathStates.includes(TransferProcessStates.COMPLETED)) {
            this.happyPathStates.pop();
          }
        }
        this.currentState = this.process.state as TransferProcessStates;
        if (this.stateHistory.length === 0) {
          this.stateHistory.push(this.currentState);
        }
      }
      this.stopStatusJob();
      this.startStatusJob();
    }
  }

  startStatusJob(): void {
    this.statusJob = setInterval(this.pullStatus.bind(this), this.pullIntervalMs);
    this.polling = true;
  }

  stopStatusJob(): void {
    if (this.statusJob) {
      clearInterval(this.statusJob);
      this.statusJob = undefined;
    }
    this.polling = false;
  }

  private async pullStatus() {
    try {
      const state = await this.transferService.getTransferProcessState(this.transferId.id);
      this.currentState = state.state as TransferProcessStates;
      if (
        // First or new state
        (this.stateHistory.length === 0 || this.stateHistory[this.stateHistory.length - 1] !== this.currentState) &&
        // Unknown states are ignored
        (this.happyPathStates.includes(this.currentState) || this.exceptionStates.includes(this.currentState))
      ) {
        // Non-normal path
        if (this.exceptionStates.includes(this.currentState)) {
          this.stopStatusJob();
          this.happyPath = false;
          this.stateHistory.push(this.currentState);
          this.process = await compact(await this.transferService.getTransferProcess(this.transferId.id));
          this.errorMsg = JSON.stringify(this.process);
        } else {
          // Include missed states due to pull mechanism
          this.stateHistory = this.happyPathStates.slice(0, this.happyPathStates.indexOf(this.currentState) + 1);
        }
      }
      // Stop for happy path end states
      if (
        (this.type === 'Pull' && this.currentState === TransferProcessStates.STARTED) ||
        this.currentState === TransferProcessStates.COMPLETED
      ) {
        this.stopStatusJob();
      }
    } catch (error) {
      console.error('Error fetching transfer process status:', error);
    }
  }

  ngOnDestroy(): void {
    this.stopStatusJob();
  }

  protected readonly TransferProcessStates = TransferProcessStates;
}
