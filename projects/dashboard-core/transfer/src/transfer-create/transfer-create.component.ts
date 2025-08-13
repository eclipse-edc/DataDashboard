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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ContractAndTransferService } from '../contract-and-transfer.service';
import {
  ContractAgreement,
  ContractNegotiation,
  DataAddress,
  IdResponse,
  TransferProcessInput,
} from '@think-it-labs/edc-connector-client';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractAgreementCardComponent } from '../contract-agreement-card/contract-agreement-card.component';
import { AlertComponent, DataAddressFormComponent } from '@eclipse-edc/dashboard-core';

@Component({
  selector: 'lib-transfer-create',
  templateUrl: './transfer-create.component.html',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    NgClass,
    ContractAgreementCardComponent,
    DataAddressFormComponent,
    AlertComponent,
  ],
})
export class TransferCreateComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('destinationComponent', { read: ViewContainerRef, static: true })
  private readonly destinationComponent!: ViewContainerRef;

  @Input() agreement!: ContractAgreement;
  @Input() negotiation!: ContractNegotiation;
  @Output() transferId = new EventEmitter<IdResponse>();

  transferTypes$: Observable<string[]> = of();
  initialized = false;
  transferForm: FormGroup;

  isPushTransfer = false;
  transferDataType = '';
  dataAddress?: DataAddress;

  errorMsg = '';

  constructor(
    private readonly transferService: ContractAndTransferService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.transferForm = this.formBuilder.group({
      transferType: new FormControl('', Validators.required),
    });

    this.transferForm
      .get('transferType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.onTransferTypeChange(type);
      });
  }

  ngOnChanges(): void {
    if (this.agreement) {
      this.transferService
        .getPossibleTransferTypes(this.agreement, this.negotiation)
        .then(types => (this.transferTypes$ = of(types)))
        .finally(() => (this.initialized = true));
    }
  }

  onTransferTypeChange(type: string) {
    const typeSplit = type.split('-');
    this.transferDataType = typeSplit[0];
    this.isPushTransfer = typeSplit[1].toLowerCase().includes('push');
  }

  onDestinationChange(address: DataAddress) {
    this.dataAddress = address;
  }

  async createTransfer() {
    if (this.negotiation.counterPartyAddress) {
      const transferInput: TransferProcessInput = {
        transferType: this.transferForm.value.transferType,
        assetId: this.agreement.assetId,
        contractId: this.agreement.id,
        counterPartyAddress: this.negotiation.counterPartyAddress,
      };
      if (this.isPushTransfer) {
        transferInput.dataDestination = this.dataAddress;
      }
      const id = await this.transferService.initiateTransferProcess(transferInput);
      if (id) {
        this.transferId.emit(id);
      }
    } else {
      this.errorMsg = 'The negotiation for this contract agreement does not contain a counter party address.';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
